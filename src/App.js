import React, { useState, useEffect} from 'react';

const PASSWORD = "Jcfl1304";

const TARGETS = {
    calories: 2050,
    protein: 165,
    carbs: 210,
    fat: 60
};

export default function App() {
    const [logged, setLogged] = useState(false);

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
            <div style={{ padding: 40 }}>
                <h2>Acceso Privado</h2>
                <input
                type="password"
                placeholder="Contraseña"
                onChange={e =>
                    e.target.value === PASSWORD && setLogged(true)
                }
                />
            </div>
        );
    }

    const addEntry = () => {
        if (!food || !calories) return;
        setEntries({
            ...entries,
            [date]: [
                ...(entries[date] || []),
                {food, calories, protein,carbs,fat}
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
        <div style={{ padding: 20, maxWidth: 600, margin: "auto"}}>
            <h1> Calorie Tracker</h1>

            <input type="date" value={date} onChange={e => setDate(e.target.value)} />

            <h2>Analizar comida con IA</h2>
            <input type="file" onChange={e => setImage(e.target.files[0])} />
            <input
                placeholder="Description (ej: 200g arroz + 150g pollo)"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <button onClick={analyzeImage}>
                {loading ? "Analizando..." : "Analizar"}
            </button>

            <h2>Añadir comida</h2>
            <input placeholder="Alimento" value={food} onChange={e => setFood(e.target.value)}/>
            <input placeholder="Calorías" value={calories} onChange={e => setCalories(e.target.value)}/>
            <input placeholder="Proteínas" value={protein} onChange={e => setProtein(e.target.value)}/>
            <input placeholder="Carbohidratos" value={carbs} onChange={e => setCarbs(e.target.value)}/>
            <input placeholder="Grasas" value={fat} onChange={e => setFat(e.target.value)}/>
            <button onClick={addEntry}>Guardar</button>

            <h3>Resumen</h3>
            <p>{totals.calories} / {TARGETS.calories} kcal</p>

            <h2>Peso</h2>
            <input
                type="number"
                step="0.1"
                placeholder="Peso kg"
                value={weight}
                onChange={e => setWeight(e.target.value)}
            />
            <button onClick={saveWeight}>Guardar peso</button>

            {weights[date] && <p>Peso: {weights[date]} kg</p>}
        </div>
    );
}