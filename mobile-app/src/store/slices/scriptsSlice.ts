import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { scriptsAPI } from '../../services/api';

export interface Script {
  id: string;
  qrCode: string;
  batchId: string;
  examId: string;
  studentId?: string;
  status: 'generated' | 'distributed' | 'collected' | 'verified' | 'scanned' | 'dispatched' | 'received' | 'graded' | 'returned';
  currentLocation: string;
  createdAt: string;
  updatedAt: string;
  movements: ScriptMovement[];
  incidents: ScriptIncident[];
}

export interface ScriptMovement {
  id: string;
  scriptId: string;
  fromLocation: string;
  toLocation: string;
  handledBy: string;
  timestamp: string;
  qrScanned: boolean;
  notes?: string;
}

export interface ScriptIncident {
  id: string;
  scriptId: string;
  type: 'missing' | 'damaged' | 'misplaced' | 'unauthorized_access';
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  resolution?: string;
}

export interface ScriptBatch {
  id: string;
  examId: string;
  totalScripts: number;
  status: 'preparing' | 'ready' | 'distributed' | 'collecting' | 'completed';
  createdAt: string;
  scripts: Script[];
}

interface ScriptsState {
  scripts: Script[];
  batches: ScriptBatch[];
  selectedScript: Script | null;
  selectedBatch: ScriptBatch | null;
  isLoading: boolean;
  error: string | null;
  scannerActive: boolean;
  recentScans: Script[];
}

const initialState: ScriptsState = {
  scripts: [],
  batches: [],
  selectedScript: null,
  selectedBatch: null,
  isLoading: false,
  error: null,
  scannerActive: false,
  recentScans: [],
};

// Async thunks
export const fetchScripts = createAsyncThunk(
  'scripts/fetchScripts',
  async (filters: { examId?: string; status?: string; batchId?: string }, { rejectWithValue }) => {
    try {
      const response = await scriptsAPI.getScripts(filters || {});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch scripts');
    }
  }
);

export const fetchScriptBatches = createAsyncThunk(
  'scripts/fetchBatches',
  async (examId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await scriptsAPI.getBatches(examId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch batches');
    }
  }
);

export const scanScript = createAsyncThunk(
  'scripts/scanScript',
  async (qrCode: string, { rejectWithValue }) => {
    try {
      const response = await scriptsAPI.scanScript(qrCode);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to scan script');
    }
  }
);

export const moveScript = createAsyncThunk(
  'scripts/moveScript',
  async (data: {
    scriptId: string;
    fromLocation: string;
    toLocation: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await scriptsAPI.moveScript(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move script');
    }
  }
);

export const reportIncident = createAsyncThunk(
  'scripts/reportIncident',
  async (data: {
    scriptId: string;
    type: string;
    description: string;
  }, { rejectWithValue }) => {
    try {
      const response = await scriptsAPI.reportIncident(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report incident');
    }
  }
);

const scriptsSlice = createSlice({
  name: 'scripts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedScript: (state, action: PayloadAction<Script | null>) => {
      state.selectedScript = action.payload;
    },
    setSelectedBatch: (state, action: PayloadAction<ScriptBatch | null>) => {
      state.selectedBatch = action.payload;
    },
    toggleScanner: (state) => {
      state.scannerActive = !state.scannerActive;
    },
    addRecentScan: (state, action: PayloadAction<Script>) => {
      state.recentScans.unshift(action.payload);
      if (state.recentScans.length > 10) {
        state.recentScans.pop();
      }
    },
    clearRecentScans: (state) => {
      state.recentScans = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch scripts
      .addCase(fetchScripts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScripts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scripts = action.payload;
      })
      .addCase(fetchScripts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch batches
      .addCase(fetchScriptBatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScriptBatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.batches = action.payload;
      })
      .addCase(fetchScriptBatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Scan script
      .addCase(scanScript.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scanScript.fulfilled, (state, action) => {
        state.isLoading = false;
        const scannedScript = action.payload;
        
        // Update the script in the scripts array
        const index = state.scripts.findIndex(s => s.id === scannedScript.id);
        if (index !== -1) {
          state.scripts[index] = scannedScript;
        } else {
          state.scripts.push(scannedScript);
        }
        
        // Add to recent scans
        state.recentScans.unshift(scannedScript);
        if (state.recentScans.length > 10) {
          state.recentScans.pop();
        }
      })
      .addCase(scanScript.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Move script
      .addCase(moveScript.fulfilled, (state, action) => {
        const updatedScript = action.payload;
        const index = state.scripts.findIndex(s => s.id === updatedScript.id);
        if (index !== -1) {
          state.scripts[index] = updatedScript;
        }
        if (state.selectedScript?.id === updatedScript.id) {
          state.selectedScript = updatedScript;
        }
      })
      // Report incident
      .addCase(reportIncident.fulfilled, (state, action) => {
        const { scriptId, incident } = action.payload;
        const script = state.scripts.find(s => s.id === scriptId);
        if (script) {
          script.incidents.push(incident);
        }
      });
  },
});

export const {
  clearError,
  setSelectedScript,
  setSelectedBatch,
  toggleScanner,
  addRecentScan,
  clearRecentScans,
} = scriptsSlice.actions;

export default scriptsSlice.reducer;
