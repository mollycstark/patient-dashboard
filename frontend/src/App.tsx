import { useState, useEffect } from "react";
import {
  Box,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem("provider_id");
    if (storedId) {
      const parsedId = parseInt(storedId);
      setProviderId(parsedId);
      fetchPatients(parsedId);
    }
  }, []);

  useEffect(() => {
    if (providerId !== null) {
      fetchPatients(providerId);
    }
  }, [providerId]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        setProviderId(data.provider_id);
        localStorage.setItem("provider_id", data.provider_id.toString());
        fetchPatients(data.provider_id);
      })
      .catch((err) => setError(err.message));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        setProviderId(data.provider_id);
        localStorage.setItem("provider_id", data.provider_id.toString());
        fetchPatients(data.provider_id);
      })
      .catch((err) => setError(err.message));
  };

  const fetchPatients = (id: number) => {
    fetch(`/api/patients?provider_id=${id}`)
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
      body: JSON.stringify({ ...form, provider_id: providerId }),
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
        fetchPatients(providerId!);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  if (providerId === null) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          {isSignup ? "Sign Up" : "Login"} to access the dashboard
        </Typography>

        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained">
              {isSignup ? "Sign Up" : "Login"}
            </Button>

            <Button variant="text" onClick={() => setIsSignup((prev) => !prev)}>
              {isSignup
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up"}
            </Button>

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        </form>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {providerId === null && (
        <form onSubmit={handleLogin}>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained">
              Login
            </Button>
            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </form>
      )}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          onClick={() => {
            setProviderId(null);
            localStorage.removeItem("provider_id");
            setEmail("");
            setPassword("");
            setPatients([]);
            setForm(defaultForm);
            setError("");
          }}
          variant="outlined"
          color="secondary"
        >
          Logout
        </Button>
      </Box>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>

      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 500 }}>
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
