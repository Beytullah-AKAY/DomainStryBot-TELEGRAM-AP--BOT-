const express = require('express');
const router = express.Router();
const domainHistory = require('./domain'); // Dosya adını düzeltin
const domainStatusHistory = require('./DomainStatus');

router.use('/domain-history', domainHistory);
router.use('/domainstatus-history', domainStatusHistory); // `/domainstatus-history` olarak değiştirildi

module.exports = router;