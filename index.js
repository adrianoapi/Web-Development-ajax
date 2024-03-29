var legenda = '';

function createRequest() {
  var request = null;
  try {
    request = new XMLHttpRequest();
  } catch(ex) {
    console.log('Problema ao inicializar o objeto XmlHttpRequest...');
    try {
      request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (ex2) {
      console.log('Problema ao inicializar o objeto ActiveXObject (Msxml2)...');
      request = new ActiveXObject("Microsoft.XMLHTTP");
    }
  }
  
  return request;
}

/**
 * Calcular
 * @param {*} person 
 * @param {*} callback 
 * @returns 
 */
function calculateImcAPI(person, callback) {
  var req = createRequest();
  if (!req) return null;

  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        callback(JSON.parse(this.responseText));
      }
    }
  }
  //old http://localhost:8080/imc/calculate
  //local: http://127.0.0.1:8000/api/imc/calculate
  req.open('POST', 'http://localhost:8080/imc/calculate', true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send(JSON.stringify({
    'weight': person.getWeight(),
    'height': person.getHeight()
  }));
}

/**
 * Pega a legedanda da tabela
 * @returns 
 */
function getTable() {
  var req = createRequest();
  if (!req) return null;

  req.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        legenda  = JSON.parse(this.responseText);
        console.log(legenda);
      }
    }
  }
  //old http://localhost:8080/imc/calculate
  //localhttp://127.0.0.1:8000/api/imc/table
  req.open('GET', 'http://localhost:8080/imc/table', true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.send();
}


function Person(height, weight) {
  if (typeof(height) !== 'number' || isNaN(height))
    throw Error('Height is not valid as a number...');
  if (typeof(weight) !== 'number' || isNaN(weight))
    throw Error('Weight is not valid as a number...');
  
  this._height = height;
  this._weight = weight;
  this.getHeight = function() {
    return this._height;
  }
  this.getWeight = function() {
    return this._weight;
  }
}

function Dietician(height, weight) {
  Person.call(this, height, weight);
  this.calculateImc = function(callback) {
    calculateImcAPI(this, callback);
  }
}
Dietician.prototype = Object.create(Person.prototype);
Dietician.prototype.constructor = Dietician;


function createDietician(inputHeight, inputWeight) {
  var height = parseFloat(inputHeight);
  var weight = parseFloat(inputWeight);
  
  return new Dietician(height, weight);
}

function calculateBuilder() {
  console.log('construindo a minha closure para manipulacao do evento de clique...');
  var heightElem = document.getElementById('height');
  var weightElem = document.getElementById('weight');
  var imcElem = document.getElementById('imc');

  return function() {
    console.log('calculando o IMC utilizando os valores do escopo léxico...');
    var dietician = createDietician(heightElem.value, weightElem.value);
    dietician.calculateImc(function (resultado) {
      drawTable(resultado);
      imcElem.innerHTML = resultado['imc'];
    });
  }
}

function drawTable(imc)
{
  var table = document.getElementById("imc-table");
  table.innerHTML = "";
  var row   = table.insertRow(0);

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);

  cell1.innerHTML = "IMC é de: " +  Math.round(imc['imc']) + "("+imc['imcDescription']+")";

  if(imc['imc'] < 18.5){
    cell2.innerHTML = "Legenda: " + legenda["0"];
  }else if(imc['imc'] >= 18.5 && imc['imc']  < 24.9){
    cell2.innerHTML = "Legenda: " + legenda["18.5"];
  }else if(imc['imc'] >= 24.9 && imc['imc']  < 99){
    cell2.innerHTML = "Legenda: " + legenda["24.9"];
  }else if(imc['imc'] >= 99){
    cell2.innerHTML = "Legenda: " + legenda["99"];
  }
}

window.onload = function(evt) {
  console.log('carreguei o conteúdo...');
  var btn = document.querySelector('div.form button');
  btn.addEventListener('click', calculateBuilder());

  // Seta global var
  getTable();

};

console.log('executei o script...');