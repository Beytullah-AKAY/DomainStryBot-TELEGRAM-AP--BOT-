const express = require('express');
const app = express();
const Routes = require('./routes');

const Express=async()=>{
    app.use(express.json());

    const API_KEY = process.env.API_KEY

    app.use('/api', Routes); 

    const port = process.env.PORT || 3000; 
    app.listen(port, () => {
        console.log(`Server ${port} portunda dinliyor...`);
    });
}

module.exports=Express
