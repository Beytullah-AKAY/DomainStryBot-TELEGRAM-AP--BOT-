const express = require('express');
const router = express.Router();
const domainHistory = require('./domain'); 
const domainStatusHistory = require('./DomainStatus');

router.use('/domain-history', domainHistory);
router.use('/domainstatus-history', domainStatusHistory); 

module.exports = router;
