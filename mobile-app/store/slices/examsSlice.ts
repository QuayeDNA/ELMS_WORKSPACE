import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { examsAPI } from '../../services/api';

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  venue: string;
  invigilators: string[];
  totalStudents: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  instructions: string;
  materials: string[];
}

interface ExamsState {
  exams: Exam[];
  selectedExam: Exam | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExamsState = {
  exams: [],
  selectedExam: null,
  isLoading: false,
  error: null,
};

export const fetchExams = createAsyncThunk(
  'exams/fetchExams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await examsAPI.getExams();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
    }
  }
);

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedExam: (state, action: PayloadAction<Exam | null>) => {
      state.selectedExam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedExam } = examsSlice.actions;
export default examsSlice.reducer;
