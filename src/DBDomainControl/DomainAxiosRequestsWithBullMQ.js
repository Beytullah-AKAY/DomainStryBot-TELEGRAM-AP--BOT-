const { Worker, Queue } =require ('bullmq');
const IORedis =require ('ioredis');
const database =require ("../utils/database.js");
const axios =require ('axios');

const DomainAxiosRequestsWithBullMQ = async () => {
  
  
  const redisConfig = {
    host: 'redis-14359.c322.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 14359,
    password: 'DomainSentry',
    maxRetriesPerRequest: null,
  };

  console.log("bağlantı yapıldı")

  const connection = new IORedis(redisConfig);
  connection.on('error', (err) => {
    console.error('Redis bağlantı hatası:', err);
  });
  const myQueue3 = await new Queue('myQueue3', { connection });
 


  
  let Domains = await database.Domain.findMany();
  Domains.forEach((domain) => {
    domain.status = null
  });
  //console.log(Domains)

  const processedDomains = new Set();

for (let domain of Domains) {
  if (!processedDomains.has(domain.name)) {
    processedDomains.add(domain.name); // Domain adını sete ekleyin
    await myQueue3.add('myQueue3', {  chatid: Number(domain.chatid), name: domain.name, status: null });
  }
}
  console.log('Tüm işlemler kuyruklara eklendi.');
  const worker3 = new Worker('myQueue3', async (job) => {
    let {  name,  status } = job.data;
  

    try {
      const response = await axios.get(`http://${name}`, {
        validateStatus: function (status) {
          return status < 400; // 400'den küçükse başarılı kabul et
        },
      });
      console.log('Status code for', name, ':', response.status);
      status = response.status;
    } catch (error) {
      console.error('Hata:', error.message);
      if (error.message.includes('ENOTFOUND')) {
        status = 404;
      } else if (error.message.includes('Request failed')) {
        status = 403;
      } else if (error.message.includes('EAI_AGAIN')) {
        status = 500;
      } else {
        status = 499;
      }
    }
   const sameNameDomains = Domains.filter((item) => item.name === name);
sameNameDomains.forEach((domain) => {
  domain.status = status; 
});
    try {
      
      await Promise.all(sameNameDomains.map(async (domain) => {
        await database.domainStatusCode.create({
          data: {
            statusCode: domain.status,
            timestamp: new Date(),
            domain: {
              connect: {
                id: domain.id
              }
            }
          }
        });
      }));
    } catch (err) {
      console.error('Veritabanı işlemi başarısız:', err);
    }
   console.log('İş tamamlandı:', job.id);

  },
    { connection }
  );
 
  worker3.on('completed',async job => {

    console.log('İş tamamlandı:', job.id);
  });

  
  worker3.on('failed', (job, err) => {
    console.error('İş başarısız oldu:', err);
  });

 
  
  console.log('Tüm işlemler tamamlandı.');
};

module.exports=DomainAxiosRequestsWithBullMQ
