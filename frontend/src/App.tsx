import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

type Patient = {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  status: string;
  address: string;
};

const defaultForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  dob: "",
  status: "Inquiry",
  address: "",
};

function App() {
  const [form, setForm] = useState(defaultForm);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset any previous error

    fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "An unknown error occurred.");
        }
        return res.json();
      })
      .then(() => {
        setForm(defaultForm);
        fetchPatients();
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>

      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack spacing={2}>
          <TextField
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Middle Name"
            name="middle_name"
            value={form.middle_name}
            onChange={handleChange}
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Date of Birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
            inputProps={{
              max: new Date().toISOString().split("T")[0], // sets today as max
            }}
          />
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={form.status}
              onChange={handleChange}
              label="Status"
            >
              {["Inquiry", "Onboarding", "Active", "Churned"].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            helperText="Street, City, State ZIP (e.g. 123 Main St, San Francisco, CA 94110)"
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" color="primary">
            Add Patient
          </Button>
        </Stack>
      </form>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Patients
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.first_name} {p.middle_name} {p.last_name}
                </TableCell>
                <TableCell>{p.dob}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default App;
