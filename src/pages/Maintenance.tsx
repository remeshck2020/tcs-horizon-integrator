import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FileExplorer from "../components/FileExplorer";
import { fileService, ErrorRecord, StatusRecord } from "../services/fileService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Maintenance = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [errorSummary, setErrorSummary] = useState<ErrorRecord | null>(null);
  const [statusRecords, setStatusRecords] = useState<StatusRecord[]>([]);
  const [showFixOptions, setShowFixOptions] = useState(false);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/");
      return;
    }
    
    // Load error summary data
    const summary = fileService.getErrorRecordSummary();
    setErrorSummary(summary);
  }, [user, navigate]);
  
  const handleFixErrors = () => {
    setShowFixOptions(true);
    setStatusRecords(fileService.getStatusRecords());
    // Clear previous selections when showing fix options
    setSelectedIndexes([]);
  };
  
  const handleActionChange = (id: number, action: string) => {
    // Update the action in statusRecords
    setStatusRecords(prev => 
      prev.map(record => 
        record.id === id ? { ...record, action } : record
      )
    );
    
    // Update selectedIndexes based on action
    if (action === "fix") {
      setSelectedIndexes(prev => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
    } else {
      setSelectedIndexes(prev => prev.filter(index => index !== id));
    }
  };
  
  const handleInitiateTransformation = async () => {
    if (selectedIndexes.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to fix",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await fileService.initiateTransformation(selectedIndexes);
      
      if (result.success) {
        // Update status of fixed items
        setStatusRecords(prev => 
          prev.map(record => 
            selectedIndexes.includes(record.id) 
              ? { ...record, status: "success", action: "fixed" } 
              : record
          )
        );
        
        // Update error summary counts
        if (errorSummary) {
          const fixedCount = selectedIndexes.length;
          const updatedSummary = {
            ...errorSummary,
            errorRecords: errorSummary.errorRecords - fixedCount,
            correctRecords: errorSummary.correctRecords + fixedCount
          };
          setErrorSummary(updatedSummary);
        }
        
        toast({
          title: "Transformation Completed",
          description: result.message
        });
        
        // Clear selected indexes but keep showing the fixed items
        setSelectedIndexes([]);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">TCS Horizon Integrator</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>
      
      <main className="container max-w-7xl mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <FileExplorer />
          </div>
          
          <div className="md:col-span-3">
            <h2 className="text-2xl font-bold mb-6">Maintenance</h2>
            
            {errorSummary && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Daily Enrollment Error Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
                      <p className="text-2xl font-bold">{errorSummary.totalRecords}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-red-500">Error Records</h3>
                      <p className="text-2xl font-bold text-red-600">{errorSummary.errorRecords}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-green-500">Correct Records</h3>
                      <p className="text-2xl font-bold text-green-600">{errorSummary.correctRecords}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button onClick={handleFixErrors}>Fix Errors</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {showFixOptions && (
              <Card>
                <CardHeader>
                  <CardTitle>Error Correction</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Preset Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statusRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.fieldName}</TableCell>
                          <TableCell>{record.presetValue}</TableCell>
                          <TableCell>
                            <span className={record.status === "error" ? "text-red-500" : "text-green-500"}>
                              {record.status === "error" ? "Error" : "Success"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {record.status === "error" && (
                              <Select 
                                onValueChange={(value) => handleActionChange(record.id, value)}
                                defaultValue="select"
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="fix">Fix it</SelectItem>
                                  <SelectItem value="ignore">Ignore</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={handleInitiateTransformation}
                      disabled={selectedIndexes.length === 0 || isLoading}
                    >
                      {isLoading ? "PROCESSING..." : "INITIATE TRANSFORMATION"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Maintenance;
