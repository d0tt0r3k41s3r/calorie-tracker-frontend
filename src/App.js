import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Typography, TextField, Button, Box, LinearProgress, Card, CardContent, Grid, Tabs, Tab, IconButton } from '@mui/material';
import { Add, CameraAlt, Scale } from '@mui/icons-material';

const PASSWORD = "Jcfl1304";

const TARGETS = {
    calories: 2050,
    protein: 165,
    carbs: 210,
    fat: 60
};

const theme = createTheme({
    palette: { primary: { main: '#ff5722' }, secondary: { main: '#4caf50' } },
});

export default function App() {
    const [logged, setLogged] = useState(false);
    const [tab, setTab] = useState(0);

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

    useEffect(() => {
        const savedEntries = localStorage.getItem("entries");
        const savedWeights = localStorage.getItem("weights");
        if (savedEntries) setEntries(JSON.parse(savedEntries));
        if (savedWeights) setWeights(JSON.parse(savedWeights));
    }, []);

    useEffect(() => {
        localStorage.setItem("entries", JSON.stringify(entries));
    }, [entries]);
    
    useEffect(() => {
        localStorage.setItem("weights", JSON.stringify(weights));
    }, [weights]);

    if (!logged) {
        return (
            <ThemeProvider theme={theme}>
                <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>Acceso Privado</Typography>
                        <TextField
                            type="password"
                            label="Contraseña"
                            fullWidth
                            onChange={e => e.target.value === PASSWORD && setLogged(true)}
                        />
                    </Card>
                </Container>
            </ThemeProvider>
        );
    }

    const addEntry = () => {
        if (!food || !calories) return;
        setEntries({
            ...entries,
            [date]: [
                ...(entries[date] || []),
                {food, calories, protein, carbs, fat}
            ]
        });
        setFood(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
    };

    const analyzeImage = async () => {
        if(!image) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("description", description);

            const res = await fetch(
                "https://calorie-tracker-backend-production-d029.up.railway.app/analyze-food",
                {method: "POST", body: formData}
            );

            if (!res.ok) {
                throw new Error(`Error en la solicitud: ${res.status}`);
            }

            const data = await res.json();
            setCalories(data.calories || "");
            setProtein(data.protein || "");
            setCarbs(data.carbs || "");
            setFat(data.fat || "");
        } catch (error) {
            console.error("Error al analizar la imagen:", error);
            alert("Error al analizar la imagen. Revisa la consola para más detalles.");
        } finally {
            setLoading(false);
        }
    };

    const saveWeight = () => {
        if (!weight) return;
        setWeights({...weights, [date]: weight});
        setWeight("");
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

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>Calorie Tracker</Typography>
                <TextField
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab label="Análisis IA" icon={<CameraAlt />} />
                    <Tab label="Añadir Comida" icon={<Add />} />
                    <Tab label="Peso" icon={<Scale />} />
                </Tabs>

                {tab === 0 && (
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Analizar comida con IA</Typography>
                        <TextField
                            type="file"
                            onChange={e => setImage(e.target.files[0])}
                            fullWidth
                            sx={{ mb: 1 }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            placeholder="Descripción (ej: 200g arroz + 150g pollo)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                        />
                        <Button variant="contained" onClick={analyzeImage} disabled={loading}>
                            {loading ? "Analizando..." : "Analizar"}
                        </Button>
                    </Card>
                )}

                {tab === 1 && (
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Añadir comida</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Alimento"
                                    value={food}
                                    onChange={e => setFood(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Calorías"
                                    value={calories}
                                    onChange={e => setCalories(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Proteínas"
                                    value={protein}
                                    onChange={e => setProtein(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Carbohidratos"
                                    value={carbs}
                                    onChange={e => setCarbs(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Grasas"
                                    value={fat}
                                    onChange={e => setFat(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <Button variant="contained" onClick={addEntry} sx={{ mt: 2 }}>Guardar</Button>
                    </Card>
                )}

                {tab === 2 && (
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Peso</Typography>
                        <TextField
                            type="number"
                            step="0.1"
                            label="Peso kg"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            fullWidth
                            sx={{ mb: 1 }}
                        />
                        <Button variant="contained" onClick={saveWeight}>Guardar peso</Button>
                        {weights[date] && <Typography sx={{ mt: 1 }}>Peso: {weights[date]} kg</Typography>}
                    </Card>
                )}

                <Card sx={{ mt: 4, p: 2 }}>
                    <Typography variant="h6">Resumen Diario</Typography>
                    <Box sx={{ mb: 1 }}>
                        <Typography>Calorías: {totals.calories} / {TARGETS.calories}</Typography>
                        <LinearProgress variant="determinate" value={Math.min((totals.calories / TARGETS.calories) * 100, 100)} />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                        <Typography>Proteínas: {totals.protein} / {TARGETS.protein} g</Typography>
                        <LinearProgress variant="determinate" value={Math.min((totals.protein / TARGETS.protein) * 100, 100)} />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                        <Typography>Carbohidratos: {totals.carbs} / {TARGETS.carbs} g</Typography>
                        <LinearProgress variant="determinate" value={Math.min((totals.carbs / TARGETS.carbs) * 100, 100)} />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                        <Typography>Grasas: {totals.fat} / {TARGETS.fat} g</Typography>
                        <LinearProgress variant="determinate" value={Math.min((totals.fat / TARGETS.fat) * 100, 100)} />
                    </Box>
                </Card>
            </Container>
        </ThemeProvider>
    );
}