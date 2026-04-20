import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Typography, TextField, Button, Box, LinearProgress, Card, CardContent, Grid, Tabs, Tab, Fab, Switch, FormControlLabel } from '@mui/material';
import { Add, CameraAlt, Scale, Brightness4, Brightness7 } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TARGETS = { calories: 2050, protein: 165, carbs: 210, fat: 60 };

const themeLight = createTheme({ palette: { primary: { main: '#ff5722' }, secondary: { main: '#4caf50' } } });
const themeDark = createTheme({ palette: { mode: 'dark', primary: { main: '#ff5722' }, secondary: { main: '#4caf50' } } });
const API_BASE = 'https://https://calorie-tracker-backend-production-d029.up.railway.app:3001';

export default function App() {
    const [logged, setLogged] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [tab, setTab] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    // Estados para datos (ahora por usuario)
    const [entries, setEntries] = useState({});
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [food, setFood] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [weight, setWeight] = useState("");
    const [weights, setWeights] = useState({});

    // Login/Registro
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);

    useEffect(() => {
        if (token) {
            setLogged(true);
            loadUserData();
        }
    }, [token]);

    const loadUserData = async () => {
        // Endpoint de datos de usuario en el backend
        const res = await fetch(`${API_BASE}/user/data`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setEntries(data.entries || {});
        setWeights(data.weights || {});
    };

    const handleAuth = async () => {
        const endpoint = `${API_BASE}/${isRegister ? 'register' : 'login'}`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: username, password })
        });
        const data = await res.json();
        if (res.ok) {
            setToken(data.token);
            localStorage.setItem('token', data.token);
            setLogged(true);
        } else {
            alert(data.error || data.message || 'Error en autenticación');
        }
    };

    const addEntry = () => {
        if (!food || !calories) return;
        const newEntries = {
            ...entries,
            [date]: [
                ...(entries[date] || []),
                {food, calories, protein, carbs, fat}
            ]
        };
        setEntries(newEntries);
        saveToBackend('entries', newEntries);
        setFood(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
    };

    const analyzeImage = async () => {
        if(!image) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("image", image);
        formData.append("description", description);
        const res = await fetch(`${API_BASE}/analyze-food`, {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCalories(data.calories || "");
        setProtein(data.protein || "");
        setCarbs(data.carbs || "");
        setFat(data.fat || "");
        setLoading(false);
    };

    const saveWeight = () => {
        if (!weight) return;
        const newWeights = {...weights, [date]: weight};
        setWeights(newWeights);
        saveToBackend('weights', newWeights);
        setWeight("");
    };

    const saveToBackend = async (key, value) => {
        await fetch(`${API_BASE}/user/data`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ [key]: value })
        });
    };

    const totals = (entries[date] || []).reduce(
        (a, e) => ({
            calories: a.calories + Number(e.calories),
            protein: a.protein + Number(e.protein),
            carbs: a.carbs + Number(e.carbs),
            fat: a.fat + Number(e.fat)
        }),
        {calories: 0, protein: 0, carbs: 0, fat: 0}
    );

    const weightData = Object.keys(weights).map(d => ({ date: d, weight: weights[d] }));

    if (!logged) {
        return (
            <ThemeProvider theme={themeLight}>
                <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom>{isRegister ? 'Registro' : 'Login'}</Typography>
                            <TextField label="Email" value={username} onChange={e => setUsername(e.target.value)} fullWidth sx={{ mb: 1 }} />
                            <TextField type="password" label="Contraseña" value={password} onChange={e => setPassword(e.target.value)} fullWidth sx={{ mb: 1 }} />
                            <Button variant="contained" onClick={handleAuth} fullWidth>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</Button>
                            <Button onClick={() => setIsRegister(!isRegister)} sx={{ mt: 1 }}>{isRegister ? 'Ya tengo cuenta' : 'Crear cuenta'}</Button>
                        </Card>
                    </motion.div>
                </Container>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={darkMode ? themeDark : themeLight}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Calorie Tracker</Typography>
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
                        label={darkMode ? <Brightness7 /> : <Brightness4 />}
                    />
                </Box>
                <TextField type="date" value={date} onChange={e => setDate(e.target.value)} sx={{ mb: 2 }} />

                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab label="Dashboard" />
                    <Tab label="Análisis IA" icon={<CameraAlt />} />
                    <Tab label="Añadir Comida" icon={<Add />} />
                    <Tab label="Peso" icon={<Scale />} />
                </Tabs>

                {tab === 0 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <Card sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6">Resumen Diario</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography>Calorías: {totals.calories} / {TARGETS.calories}</Typography>
                                    <LinearProgress variant="determinate" value={Math.min((totals.calories / TARGETS.calories) * 100, 100)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography>Proteínas: {totals.protein} / {TARGETS.protein} g</Typography>
                                    <LinearProgress variant="determinate" value={Math.min((totals.protein / TARGETS.protein) * 100, 100)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography>Carbohidratos: {totals.carbs} / {TARGETS.carbs} g</Typography>
                                    <LinearProgress variant="determinate" value={Math.min((totals.carbs / TARGETS.carbs) * 100, 100)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography>Grasas: {totals.fat} / {TARGETS.fat} g</Typography>
                                    <LinearProgress variant="determinate" value={Math.min((totals.fat / TARGETS.fat) * 100, 100)} />
                                </Grid>
                            </Grid>
                        </Card>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Historial de Peso</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="weight" stroke="#ff5722" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                )}

                {tab === 1 && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Analizar comida con IA</Typography>
                            <TextField type="file" onChange={e => setImage(e.target.files[0])} fullWidth sx={{ mb: 1 }} InputLabelProps={{ shrink: true }} />
                            <TextField placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} fullWidth sx={{ mb: 1 }} />
                            <Button variant="contained" onClick={analyzeImage} disabled={loading}>{loading ? "Analizando..." : "Analizar"}</Button>
                        </Card>
                    </motion.div>
                )}

                {tab === 2 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Añadir comida</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField label="Alimento" value={food} onChange={e => setFood(e.target.value)} fullWidth /></Grid>
                                <Grid item xs={6}><TextField label="Calorías" value={calories} onChange={e => setCalories(e.target.value)} fullWidth /></Grid>
                                <Grid item xs={6}><TextField label="Proteínas" value={protein} onChange={e => setProtein(e.target.value)} fullWidth /></Grid>
                                <Grid item xs={6}><TextField label="Carbohidratos" value={carbs} onChange={e => setCarbs(e.target.value)} fullWidth /></Grid>
                                <Grid item xs={6}><TextField label="Grasas" value={fat} onChange={e => setFat(e.target.value)} fullWidth /></Grid>
                            </Grid>
                            <Button variant="contained" onClick={addEntry} sx={{ mt: 2 }}>Guardar</Button>
                        </Card>
                    </motion.div>
                )}

                {tab === 3 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">Peso</Typography>
                            <TextField type="number" step="0.1" label="Peso kg" value={weight} onChange={e => setWeight(e.target.value)} fullWidth sx={{ mb: 1 }} />
                            <Button variant="contained" onClick={saveWeight}>Guardar peso</Button>
                            {weights[date] && <Typography sx={{ mt: 1 }}>Peso: {weights[date]} kg</Typography>}
                        </Card>
                    </motion.div>
                )}

                <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={() => setTab(2)}>
                    <Add />
                </Fab>
            </Container>
        </ThemeProvider>
    );
}