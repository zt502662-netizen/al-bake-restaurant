const express=require('express'),http=require('http'),{Server}=require('socket.io'),path=require('path'),fs=require('fs'),QRCode=require('qrcode');
const app=express(),server=http.createServer(app),io=new Server(server),PORT=process.env.PORT||3000;
const DB_DIR=path.join(__dirname,'database');
const QR_DIR=path.join(__dirname,'qr-codes');
if(!fs.existsSync(DB_DIR))fs.mkdirSync(DB_DIR,{recursive:true});
if(!fs.existsSync(QR_DIR))fs.mkdirSync(QR_DIR,{recursive:true});
const DB_PATH=path.join(DB_DIR,'data.json');

class JsonDB{
  constructor(f){this.f=f;this.data=this.load()}
  load(){try{if(fs.existsSync(this.f))return JSON.parse(fs.readFileSync(this.f,'utf8'))}catch(e){}return{categories:[],menu_items:[],orders:[],order_items:[],nextOrderId:1}}
  save(){fs.writeFileSync(this.f,JSON.stringify(this.data,null,2),'utf8')}
}
const db=new JsonDB(DB_PATH);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/assets',express.static(path.join(__dirname,'public')));
app.use('/admin',express.static(path.join(__dirname,'admin')));
app.use('/qr-codes',express.static(path.join(__dirname,'qr-codes')));

app.get('/table/:num',(req,res)=>{
  const n=parseInt(req.params.num);
  if(n>=1&&n<=20)res.sendFile(path.join(__dirname,'public','index.html'));
  else res.status(404).send('Invalid table');
});
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

// Seed menu data
if(db.data.categories.length===0){
  console.log('Adding Al Bake menu...');
  db.data.categories=[
    {id:1,name:'Regular Pizza',sort:1},{id:2,name:'Special Pizza',sort:2},{id:3,name:'Kabab Pizza',sort:3},
    {id:4,name:'Signature Pizza',sort:4},{id:5,name:'Burgers',sort:5},{id:6,name:'Chicken Wings',sort:6},
    {id:7,name:'Shawarma & Rolls',sort:7},{id:8,name:'Sandwich',sort:8},{id:9,name:'Pasta',sort:9},
    {id:10,name:'Fries',sort:10},{id:11,name:'Deals',sort:11}
  ];
  let id=1;
  const items=[];
  const push=(cat,name,price,sizes,customizable)=>items.push({id:id++,category_id:cat,name,price,sizes:sizes||[],is_customizable:customizable?1:0});

  // Regular Pizza
  ['Chicken Tikka BBQ','Chicken Fajita','Hot And Spicy','Chicken Tandori','Vegetable Lover'].forEach(n=>
    push(1,n,500,[{n:'Small',p:500},{n:'Medium',p:950},{n:'Large',p:1350},{n:'XL',p:1800}],true));
  // Special Pizza
  ['Al Bake Special Pizza','Seekh Kabab Pizza','Chicken Achari Pizza','Chicken Supreme','Cheese Lover'].forEach(n=>
    push(2,n,550,[{n:'Small',p:550},{n:'Medium',p:1100},{n:'Large',p:1450},{n:'XL',p:1900}],true));
  // Kabab Pizza
  push(3,'Stuff Crust',1250,[{n:'Medium',p:1250},{n:'Large',p:1600},{n:'Family',p:2000}],true);
  push(3,'Behari Kabab',1250,[{n:'Medium',p:1250},{n:'Large',p:1600},{n:'Family',p:2000}],true);
  push(3,'Ch. Cheeze Stuffer',1400,[{n:'Medium',p:1400},{n:'Large',p:2000},{n:'Family',p:2200}],true);
  push(3,'Square Stuffer Pizza',1800,[{n:'Large',p:1800},{n:'Family',p:2200}],true);
  // Signature Pizza
  push(4,'Crown Crust',1200,[{n:'Medium',p:1200},{n:'Large',p:1550},{n:'Family',p:2000}],true);
  push(4,'Spe. Peri-Peri',1200,[{n:'Medium',p:1200},{n:'Large',p:1550},{n:'Family',p:2000}],true);
  push(4,'Malai Boti',1150,[{n:'Medium',p:1150},{n:'Large',p:1500},{n:'Family',p:2000}],true);
  push(4,'Square Pizza',1250,[{n:'Medium',p:1250},{n:'Large',p:1600},{n:'Family',p:1900}],true);
  push(4,'Rectangular Pizza',1850,[{n:'Family',p:1850}],true);
  // Burgers
  [{n:'Zinger Burger',p:380},{n:'Cheeze Zinger Burger',p:430},{n:'White Special Zinger',p:430},{n:'Double Decker',p:600},{n:'Grill Burger',p:500},{n:'Smoke Burger',p:390},{n:'Reggy Burger',p:300},{n:'Tikka Spicy',p:300},{n:'Tower Burger',p:500},{n:'Pizza Burger',p:450}].forEach(b=>push(5,b.n,b.p,[],true));
  // Chicken Wings
  [{n:'10 Hot Wings',p:500},{n:'5 Hot Wings',p:270},{n:'10 BBQ Wings',p:500},{n:'10 Oven Baked',p:500},{n:'10 Nuggets',p:500},{n:'5 Nuggets',p:270},{n:'10 Hot Shot',p:350},{n:'1 Chicken Piece (BL)',p:230}].forEach(w=>push(6,w.n,w.p,[]));
  // Shawarma & Rolls
  [{n:'Chicken Shawarma',p:250},{n:'Zinger Paratha Roll',p:380},{n:'Zinger Cheeze Roll',p:430},{n:'Zinger Shawarma',p:380},{n:'Platter Shawarma',p:450},{n:'Bar B Q Roll',p:350},{n:'Behari Roll',p:350},{n:'Malai Boti Roll',p:350},{n:'Cheeze Slice',p:60}].forEach(s=>push(7,s.n,s.p,[]));
  // Sandwich
  [{n:'Pizza Stacker',p:700},{n:'Kabab Bite',p:550},{n:'Euro Sandwich',p:550},{n:'Mexican Sandwich',p:600}].forEach(s=>push(8,s.n,s.p,[]));
  // Pasta
  push(9,'Crunchy Pasta',600,[]);push(9,'Makroni Pasta',500,[]);
  // Fries
  [{n:'Reg. Fries',p:200},{n:'Medium Fries',p:250},{n:'Family Fries',p:400},{n:'Loaded Fries',p:550},{n:'Special Sauce',p:80},{n:'Dip Sauce',p:50}].forEach(f=>push(10,f.n,f.p,[]));
  // Deals
  [{n:'Deal 1: Zinger Burger + Fries + Drink',p:630},{n:'Deal 2: Zinger Burger + Drink',p:430},{n:'Deal 3: Pizza Burger + Drink',p:550},{n:'Deal 4: Reggy Burger + Drink',p:350},{n:'Deal 5: Zinger Shawarma + Drink',p:430},{n:'Deal 6: 2 Zinger + Fries + Drink',p:1050},{n:'Deal 7: 2 Zinger + Half Litr Drink',p:850},{n:'Deal 8: 3 Zinger + 1L Drink',p:1350},{n:'Deal 9: 4 Zinger + 1.5L Drink',p:1700},{n:'Deal 10: 5 Zinger + 1.5L Drink',p:2150},{n:'Deal 11: 10 Hot Wings + Drink',p:560},{n:'Deal 12: Chicken Paratha + Drink',p:350},{n:'Deal 13: Small Pizza + 6 Wings + Drink',p:880},{n:'Deal 14: Small Pizza + Drink',p:600},{n:'Deal 15: Small Pizza + Zinger + Drink',p:950},{n:'Deal 16: 2 Small Pizza + 1L Drink',p:1150},{n:'Deal 17: Med Pizza + 1L Drink',p:1050},{n:'Deal 18: Med Pizza + 6 Wings + 1L Drink',p:1380},{n:'Deal 19: 2 Med Pizza + 1.5L Drink',p:2050},{n:'Deal 20: Large + Small Pizza + 1.5L Drink',p:2000},{n:'Deal 21: Large Pizza + 1L Drink',p:1500},{n:'Deal 22: Large Pizza + 10 Wings + 1L Drink',p:1950},{n:'Deal 23: 2 Large Pizza + 1.5L Drink',p:2800},{n:'Deal 24: Large Pizza + Pasta + 10 Wings + Fries + 1.5L Drink',p:2800}].forEach(d=>push(11,d.n,d.p,[]));

  db.data.menu_items=items;
  db.data.orders=[];db.data.order_items=[];db.data.nextOrderId=1;
  db.save();
  console.log('Menu added: '+items.length+' items');
}

// Pizza extras
const PIZZA_EXTRAS=[{n:'Extra Cheese',p:150},{n:'Jalapeños',p:80},{n:'Mushrooms',p:100},{n:'Olives',p:80},{n:'Extra Chicken',p:100}];
const BURGER_EXTRAS=[{n:'Extra Cheese',p:100},{n:'Extra Patty',p:150},{n:'Fried Egg',p:80},{n:'Jalapeños',p:60}];
const SAUCES=[{n:'Special Sauce',p:80},{n:'Dip Sauce',p:50},{n:'Garlic Mayo',p:50},{n:'Hot Sauce',p:40}];

// API
app.get('/api/categories',(req,res)=>res.json(db.data.categories.sort((a,b)=>a.sort-b.sort)));
app.get('/api/menu',(req,res)=>res.json(db.data.menu_items.map(m=>({...m,category_name:db.data.categories.find(c=>c.id===m.category_id)?.name}))));
app.get('/api/menu/category/:id',(req,res)=>res.json(db.data.menu_items.filter(m=>m.category_id===parseInt(req.params.id))));
app.get('/api/extras/:itemId',(req,res)=>{
  const item=db.data.menu_items.find(m=>m.id===parseInt(req.params.itemId));
  if(!item)return res.json([]);
  if(item.category_id<=4)res.json([...PIZZA_EXTRAS,...SAUCES]);
  else if(item.category_id===5)res.json([...BURGER_EXTRAS,...SAUCES]);
  else res.json(SAUCES);
});

app.post('/api/orders',(req,res)=>{
  const{table_number,items,notes,order_type,customer}=req.body;
  if(!items||!items.length)return res.status(400).json({error:'Items required'});
  const type=order_type||'dine_in';
  if(type==='delivery'&&(!customer||!customer.name||!customer.phone||!customer.address))
    return res.status(400).json({error:'Customer info required for delivery'});
  let total=0;items.forEach(i=>{total+=(i.unit_price+(i.extras_price||0))*i.quantity});
  const oid=db.data.nextOrderId++;
  const order={id:oid,table_number:type==='dine_in'?parseInt(table_number||0):0,order_type:type,status:'pending',total_amount:total,notes:notes||'',customer:type==='delivery'?customer:null,created_at:new Date().toISOString(),completed_at:null};
  const ois=items.map((it,i)=>({id:Date.now()+i,order_id:oid,item_id:it.item_id,item_name:it.item_name,quantity:it.quantity,unit_price:it.unit_price,extras_detail:it.extras_detail||'',extras_price:it.extras_price||0}));
  db.data.orders.push(order);db.data.order_items.push(...ois);db.save();
  const full={...order,items:ois};io.emit('new-order',full);
  res.json({success:true,order:full});
});

app.get('/api/orders',(req,res)=>{
  let orders=[...db.data.orders].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  if(req.query.status)orders=orders.filter(o=>o.status===req.query.status);
  else orders=orders.slice(0,50);
  res.json(orders.map(o=>({...o,items:db.data.order_items.filter(oi=>oi.order_id===o.id)})));
});

app.put('/api/orders/:id/status',(req,res)=>{
  const order=db.data.orders.find(o=>o.id===parseInt(req.params.id));
  if(!order)return res.status(404).json({error:'Not found'});
  const{status}=req.body;
  if(!['pending','preparing','ready','delivered','cancelled'].includes(status))return res.status(400).json({error:'Invalid'});
  order.status=status;
  if(status==='delivered'||status==='cancelled')order.completed_at=new Date().toISOString();
  db.save();io.emit('order-updated',order);
  res.json({success:true,order});
});

// QR code page
app.get('/api/server-info',(req,res)=>{
  const os=require('os'),nets=os.networkInterfaces();let ip='localhost';
  for(const n of Object.keys(nets))for(const i of nets[n])if(i.family==='IPv4'&&!i.internal){ip=i.address;break}
  res.json({ip,port:PORT});
});

io.on('connection',s=>{console.log('Connected:',s.id);s.on('disconnect',()=>console.log('Disconnected:',s.id))});

// Generate QR codes on startup
async function generateQRs(){
  const os=require('os'),nets=os.networkInterfaces();let ip='localhost';
  for(const n of Object.keys(nets))for(const i of nets[n])if(i.family==='IPv4'&&!i.internal){ip=i.address;break}
  const base=process.env.RENDER_EXTERNAL_URL||`http://${ip}:${PORT}`;
  for(let t=1;t<=10;t++){
    await QRCode.toFile(path.join(QR_DIR,`table-${t}.png`),`${base}/table/${t}`,{width:400,margin:2,color:{dark:'#000',light:'#fff'}});
  }
  console.log(`QR codes generated: ${base}`);
}

server.listen(PORT,'0.0.0.0',async()=>{
  const os=require('os'),nets=os.networkInterfaces();let ip='localhost';
  for(const n of Object.keys(nets))for(const i of nets[n])if(i.family==='IPv4'&&!i.internal){ip=i.address;break}
  const base=process.env.RENDER_EXTERNAL_URL||`http://${ip}:${PORT}`;
  await generateQRs();
  console.log('');
  console.log('='.repeat(50));
  console.log('  AL BAKE - QR Order System Running!');
  console.log('='.repeat(50));
  console.log(`  URL: ${base}`);
  console.log(`  Customer: ${base}/table/1`);
  console.log(`  Admin:    ${base}/admin`);
  console.log('='.repeat(50));
});
