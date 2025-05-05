
// Mock service to simulate file reading operations
// In a real application, this would interact with backend APIs

export interface ErrorRecord {
  totalRecords: number;
  errorRecords: number;
  correctRecords: number;
}

export interface StatusRecord {
  id: number;
  fieldName: string;
  presetValue: string;
  status: "error" | "success";
  action: string;
}

export const fileService = {
  getErrorRecordSummary: (): ErrorRecord => {
    // Simulate reading from C:\Users\KumaranMrRemeshChemb\Documents\Hirizon\error_record\error_record.csv
    return {
      totalRecords: 1250,
      errorRecords: 32,
      correctRecords: 1218
    };
  },
  
  getStatusRecords: (): StatusRecord[] => {
    // Simulate reading from C:\Users\KumaranMrRemeshChemb\Documents\Hirizon\status_file\Status_original.csv
    return [
      { id: 1, fieldName: "First Name", presetValue: "John", status: "success", action: "" },
      { id: 2, fieldName: "Last Name", presetValue: "Smith", status: "success", action: "" },
      { id: 3, fieldName: "Phone", presetValue: "+1234567", status: "error", action: "" },
      { id: 4, fieldName: "Email", presetValue: "john@example", status: "error", action: "" },
      { id: 5, fieldName: "Address", presetValue: "123 Main St", status: "success", action: "" },
      { id: 6, fieldName: "City", presetValue: "New York", status: "success", action: "" },
      { id: 7, fieldName: "ZIP", presetValue: "ABC123", status: "error", action: "" },
      { id: 8, fieldName: "State", presetValue: "NY", status: "success", action: "" }
    ];
  },
  
  initiateTransformation: async (indexesToFix: number[]): Promise<{ success: boolean; message: string }> => {
    // Making an actual API call to the Flask backend
    console.log("Sending indexes to fix:", indexesToFix);
    
    try {
      // Real API call to the Flask backend
      const response = await fetch('http://localhost:8000/process-files/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index_to_fix: indexesToFix }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        success: true, 
        message: data.message || "Files processed successfully" 
      };
    } catch (error) {
      console.error("Error initiating transformation:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
};
