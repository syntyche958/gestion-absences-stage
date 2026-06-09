const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const app = express();
const pool = require('./config/db');
const testRoutes = require('./routes/test.routes');
const etudiantRoutes = require('./routes/etudiant.routes');
const absenceRoutes = require('./routes/absence.routes');
const dossierRoutes = require('./routes/dossier.routes');
const actionRoutes = require('./routes/action.routes');
const disponibiliteRoutes = require('./routes/disponibilite.routes');
const convocationRoutes = require('./routes/convocation.routes');
const historiqueRoutes = require('./routes/historique.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/etudiants',etudiantRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/disponibilites', disponibiliteRoutes);
app.use('/api/convocations', convocationRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/dashboard', dashboardRoutes);

pool.query('SELECT NOW()', (err,res) => {
    if(err) {
        console.error(err);
    }else {
        console.log('Base PostgreSQL connectée');
    }
});

app.get('/', (req, res) => {
  res.send('API Gestion Absences fonctionne');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});