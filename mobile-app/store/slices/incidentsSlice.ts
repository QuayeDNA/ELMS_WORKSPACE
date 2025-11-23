import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { incidentsAPI } from '../../services/api';

export interface Incident {
  id: string;
  type: 'script_missing' | 'script_damaged' | 'equipment_failure' | 'security_breach' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  resolvedAt?: string;
  resolution?: string;
  location: string;
  examId?: string;
  scriptId?: string;
}

interface IncidentsState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: IncidentsState = {
  incidents: [],
  selectedIncident: null,
  isLoading: false,
  error: null,
};

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await incidentsAPI.getIncidents();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch incidents');
    }
  }
);

export const createIncident = createAsyncThunk(
  'incidents/createIncident',
  async (data: Partial<Incident>, { rejectWithValue }) => {
    try {
      const response = await incidentsAPI.createIncident(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create incident');
    }
  }
);

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedIncident: (state, action: PayloadAction<Incident | null>) => {
      state.selectedIncident = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incidents = action.payload;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.incidents.unshift(action.payload);
      });
  },
});

export const { clearError, setSelectedIncident } = incidentsSlice.actions;
export default incidentsSlice.reducer;
