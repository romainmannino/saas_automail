
// SaaS Auto-généré - Automatisation des relances mails
// Tech Stack: Node.js (Express) + Mailgun

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const dotenv = require('dotenv');

dotenv.config(); // Chargement des variables d'environnement

const app = express();
const port = process.env.PORT || 3001;

// Configuration de stockage des fichiers uploadés
const upload = multer({ dest: 'uploads/' });

// Initialisation de Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: 'https://api.mailgun.net'
});

// API pour upload CSV et traiter les contacts
app.post('/upload', upload.single('file'), (req, res) => {
    let contacts = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => contacts.push(data))
        .on('end', () => {
            fs.unlinkSync(req.file.path); // Supprime le fichier après lecture
            sendEmails(contacts);
            res.json({ message: 'Emails en cours d\'envoi', contacts });
        });
});

// Fonction d'envoi des emails avec Mailgun
async function sendEmails(contacts) {
    for (let contact of contacts) {
        let emailData = {
            from: 'Your Business <your-email@example.com>',
            to: contact.email,
            subject: 'Relance personnalisée',
            text: `Bonjour ${contact.nom},\n\nNous vous contactons pour vous proposer une offre exclusive. Contactez-nous pour en savoir plus !`
        };

        await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
    }
}

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
