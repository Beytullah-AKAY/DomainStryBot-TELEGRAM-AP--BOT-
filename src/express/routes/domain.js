const express = require('express');
const router = express.Router();
const database = require('../../utils/database');

const API_KEY = process.env.API_KEY;

const domainHistory=async (req, res) => {
  const apiKey = req.header('x-api-key');

  if (apiKey !== API_KEY) {
    return res.status(401).json({ message: 'Yetkisiz erişim.' });
  }

  const { page_index, page_size } = req.body;

  try {
    const domainHistory = await database.domain.findMany();
   // console.log(domainHistory)
    const startIndex = page_index * page_size;
    const endIndex = startIndex + page_size;
    const items = domainHistory.slice(startIndex, endIndex);

   
    const formattedItems = items.map(item => ({
        ...item,
        chatid: item.chatid.toString()
    }));

    const response = {
        page_index,
        page_size,
        count: domainHistory.length,
        items: formattedItems,
    };

    res.status(200).json(response); 

} catch (error) {
    console.error('Domain geçmişi alırken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
}
}

module.exports = domainHistory;
