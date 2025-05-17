const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'best-of-sleep-calculator.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Sleep Calculator app listening at http://localhost:${port}`);
}); 