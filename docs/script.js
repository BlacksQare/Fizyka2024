var angle=20;
var v=0;
var f;
var s=5;
var s_scale=50;
var odbicia=0
var eps;
var triangle;
var slider;
var spring;
var visualisation
var simulation_time;
var animation_time=250;
var slider_o_positionf
var sinmcos;
var sinpcos;
var sina;
var cosa

var v_values;

var style

var bounce_chart

function readValues(){
  angle=document.getElementById("angle").value
  v=document.getElementById("v").value
  f=document.getElementById("f").value
  eps=document.getElementById("eps").value
  if(angle=="")angle=30
  if(v=="") v=10
  if(f=="") f=0.04
  if(eps=="") eps=0.0001
  simulation_time=animation_time/document.getElementById("simulation-speed-input").value
  sina=Math.sin(toRad(angle));
  cosa=Math.cos(toRad(angle))
  sinmcos=sina-f*cosa
  sinpcos=sina+f*cosa
}

function evaluateValues(){
  // readValues()
  if(isNaN(angle)||isNaN(v)||isNaN(f)||isNaN(eps)){
    showAlert("Nieprawidłowe wartości!")
    return false
  }
  if(!(angle>=0&&angle<=90)){
    showAlert("Nieprawidłowa wartosc kąta!")
    return false
  }
  if(!(v>=0&&v<=1000)){
    showAlert("Nieprawidłowa wartość prędkości!")
    return false
  }
  if(!(f>=0&&f<=25)){
    showAlert("Nieprawidłowa wartość współczynnika tarcia!")
    return false
  }
  if(!(eps>0&&eps<1)){
    showAlert("Nieprawidłowa wartość epsilionu!")
    return false
  }
  return true
}

function plotBuilder(){

  v_values={
    org:{
      starting_s: (calcS(v, angle))*s_scale,
      height: 0,
      width: 0,
      slider_size: 50,
      spring_length: 50,
      offset_X: 200,
      offset_Y: 200
    },
    norm:{
      starting_s: 0,
      height: 0,
      width: 0,
      slider_size: 0,
      spring_length: 0,
      offset_X: 0,
      offset_Y: 0
    }
  }

  v_values.org.starting_s+=1.2*v_values.org.slider_size

  v_values.org.height=v_values.org.starting_s*Math.sin(toRad(angle))
  v_values.org.width=v_values.org.starting_s*Math.cos(toRad(angle));

  [v_values.norm.height, v_values.norm.width, v_values.norm.slider_size, v_values.norm.starting_s, v_values.norm.offset_X, v_values.norm.offset_Y]=normalize(
    300,v_values.org.height, v_values.org.width, v_values.org.slider_size, v_values.org.starting_s, v_values.org.offset_X, v_values.org.offset_Y);

  if(v_values.norm.slider_size<10){
    v_values.norm.slider_size=10
    v_values.norm.offset_X=v_values.norm.offset_Y=10
    document.getElementById("simulation-comment").innerHTML="(Ze względu na zbyt dużą skalę wizualizacji, rozmiar bloczka został dostowany tak aby był on widoczny)"
    
  } else {
    document.getElementById("simulation-comment").innerHTML=""
  }
  v_values.norm.spring_length=v_values.norm.slider_size



  return [[v_values.norm.offset_X,v_values.norm.height+v_values.norm.offset_Y], [v_values.norm.width+v_values.norm.offset_X, v_values.norm.height+v_values.norm.offset_Y], [v_values.norm.width+v_values.norm.offset_X,v_values.norm.offset_Y]]
}

function showAlert(text="calculating"){
  if(text=="calculating"){
    document.getElementById("alert-container").innerHTML=document.getElementById("calculating-placeholder").innerHTML
    document.getElementById("alert").classList.add("alert-visible")
  } else {
    document.getElementById("alert-container").innerHTML=document.getElementById("message-placeholder").innerHTML
    document.getElementById("current-message").innerHTML=text
    document.getElementById("alert").classList.add("alert-visible")
  }
  document.getElementById("alert-close").onclick=()=>{
    simulationStop()
    closeAlert()
  }
}

function closeAlert(){
  document.getElementById("alert-container").innerHTML=""
  document.getElementById("alert").classList.remove("alert-visible")
}

function updateCanvas(){
  readValues()
  
  bounce_chart.data.labels=[];
  bounce_chart.data.datasets[0].data=[]
  bounce_chart.data.datasets[1].data=[]
  bounce_chart.update()
  // starting_s=calcS(v, angle)*s_scale
  slider.transform({})
  triangle.plot(plotBuilder())

  visualisation.size(v_values.norm.width+v_values.norm.offset_X*2,v_values.norm.height+v_values.norm.offset_Y*2)
  
  spring.plot([
    [v_values.norm.offset_X-1, v_values.norm.height+v_values.norm.offset_Y],
    [v_values.norm.offset_X-Math.cos(toRad(90-angle))*v_values.norm.spring_length-1, v_values.norm.offset_Y+v_values.norm.height-Math.sin(toRad(90-angle))*v_values.norm.spring_length]
  ])
  
  slider_o_position={
    x: v_values.norm.offset_X-Math.cos(toRad(90-angle))*v_values.norm.slider_size, 
    y: v_values.norm.offset_Y+v_values.norm.height-Math.sin(toRad(90-angle))*v_values.norm.slider_size-1
  }
  
  moveSliderToOrigin(false)
  slider.transform({origin: 'top left', rotate: -angle})
  slider.size(v_values.norm.slider_size, v_values.norm.slider_size)
}

function moveSlider(k, time=simulation_time){
  if(!time){
    slider.move(slider_o_position.x+k,slider_o_position.y)
    return
  }
  slider.animate(time, 0).ease(">").move(slider_o_position.x+k,slider_o_position.y)
}

function moveSliderToOrigin(animate=true){
  if(!animate){
    slider.move(slider_o_position.x, slider_o_position.y)
    return
  }
  slider.animate(simulation_time, 0).ease("<").move(slider_o_position.x, slider_o_position.y)
}


var is_running=false

async function simulationStart(skip=false) {
  if(is_running){
    return
  }
  var h=0
  is_running=true;
  var last_s=0;
  while(true){
    odbicia++;
    last_s=s
    s=v*v/(19.62*sinpcos)
    if(isNaN(s)){
      // moveSlider(last_s)
      simulationStop();
      break;
    }
    if(!skip){
      await sleep(simulation_time)
      moveSliderToOrigin()
      await sleep(simulation_time)
    } else {
      await sleep(0)
    }
    if(!skip){
      moveSlider(s*s_scale*v_values.norm.starting_s/v_values.org.starting_s)
    }
    v=Math.sqrt(19.62*s*sinmcos)

    h=(s*sina).toFixed(6)
    bounce_chart.data.labels.push(odbicia);
    bounce_chart.data.datasets[0].data.push(h)
    bounce_chart.data.datasets[1].data.push(v)
    if(!skip){
      bounce_chart.update()
    }
    document.getElementById("current-log").innerHTML="Wysokosc: "+h+"<br>Odbicia: "+odbicia
    if(s<=eps||odbicia>20000||(s==last_s&&odbicia>100)||!is_running||isNaN(s)){
      simulationStop()
      if(s==last_s&&odbicia>100){
        showAlert("Maksymalna ilość odbić bez zmiany wyników zostałą osiągnięta.<br><span>(wykres funkcji stałej)</span>")
      }
      if(s<=eps){
        document.getElementById("start-stop").classList.add("button-hidden")
        document.getElementById("skip").classList.add("button-hidden")
        moveSliderToOrigin()
      }
      bounce_chart.update()
      break
    }
  }
}

function simulationStop(){
  is_running=false
  document.getElementById("start-stop").classList.add("start");
  document.getElementById("start-stop").classList.remove("stop");
  document.getElementById("start-stop").innerHTML="Start"
  document.getElementById("reset").classList.add("reset-visible")
  closeAlert()
}

function simulationReset(){
  simulationStop()
  updateCanvas()
  moveSliderToOrigin(false)
  document.getElementById("start-stop").classList.remove("button-hidden")
  document.getElementById("skip").classList.remove("button-hidden")
  odbicia=0
  // document.getElementById("reset").classList.add("reset-visible")
}

window.onload=async ()=>{
  readValues()
  plotBuilder()
  // starting_s=calcS(v, angle)*s_scale
  style = getComputedStyle(document.body)
  visualisation = SVG().addTo('#animation-container')
  triangle = visualisation.polygon().fill('none').stroke({width: 3, color: '#fff'})
  spring = visualisation.polyline().stroke({width: 4, color: style.getPropertyValue('--color-blue')})
  slider = visualisation.rect(v_values.norm.slider_size, v_values.norm.slider_size).fill(style.getPropertyValue('--color-red'));
  
  bounce_chart=new Chart(document.getElementById('bounce-chart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Maksymalna wysokość jaką osiągnął bloczek (m)',
        data: [],
        showLine: false,
        backgroundColor: style.getPropertyValue('--color-blue'),
        pointStyle: 'circle',
        pointRadius: 4
      },
      {
        label: 'Predkość uzyskana po odbiciu (m/s)',
        data: [],
        showLine: false,
        backgroundColor: style.getPropertyValue('--color-green'),
        pointStyle: 'circle',
        pointRadius: 4
      }
    ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  updateCanvas()
  moveSliderToOrigin(false)

  setInputFilter(document.getElementById("angle"), function(value) {
    return /^$|^(90|[0-8]?[0-9](?:[.,][0-9]?)?)$/.test(value);
  }, "Wpisz liczbę z zakresu 0-90, z dokładnością do jednej cyfry po przecinku");

  setInputFilter(document.getElementById("v"), function(value) {
    return /^(1000|100|[1-9]?[0-9]{1,2})([.,][0-9]{0,2})?$|^$/gm.test(value);
  }, "Wpisz liczbę z zakresu 0-1000, z dokładnością do dwóch cyfry po przecinku");

  setInputFilter(document.getElementById("f"), function(value) {
    return /^(|0\.|0,|([0-1]?[0-9](\.[0-9]{1,5}|,[0-9]{1,5})?|2[0-4](\.[0-9]{1,5}|,[0-9]{1,5})?|25(\.[0-9]{1,5}|,[0-9]{1,5})?))$/gm.test(value);
  }, "Wpisz liczbę z zakresu 0-25, z dokładnością do pięciu cyfry po przecinku");

  setInputFilter(document.getElementById("eps"), function(value) {
    return /^(|0\.|0,|0*(\.[0-9]{1,5}|,[0-9]{1,5})?|0\.[0-9]{1,5}|0,[0-9]{1,5}|0*[0-9]{1}(\.[0-9]{1,5}|,[0-9]{1,5})?)$/gm.test(value);
  }, "Wpisz liczbę z zakresu 0-1, z dokładnością do pięciu cyfr po przecinku");


  var inputs=["angle", "v", "f", "eps"]

  inputs.forEach(id => {
    document.getElementById(id).oninput=()=>simulationReset()
    // document.getElementById(id).onchange=()=>evaluateValues()
  });

  document.getElementById("simulation-speed-input").oninput=(e)=>{
    simulation_time=animation_time/e.target.value
  }
  
  document.getElementById("skip").onclick=async (e)=>{
    if(!evaluateValues()){
      return
    }
    simulationStop()
    await sleep(500)
    showAlert()
    moveSliderToOrigin(true)
    await sleep(500)
    simulationStart(true)
    document.getElementById("reset").classList.add("reset-visible")
  }

  document.getElementById("reset").onclick=(e)=>{
    simulationReset()
    document.getElementById("reset").classList.remove("reset-visible")
  }

  document.getElementById("start-stop").onclick=async (e)=>{
    if(!is_running){
      if(!evaluateValues()){
        return
      }
      e.target.classList.add("stop");
      e.target.classList.remove("start");
      e.target.innerHTML="Stop"
      s=calcS(v, angle)
      moveSliderToOrigin()
      document.getElementById("reset").classList.remove("reset-visible")
      await simulationStart()
    } else{
      e.target.classList.add("start");
      e.target.classList.remove("stop");
      e.target.innerHTML="Start"
      simulationStop()
      document.getElementById("reset").classList.add("reset-visible")
    }
  }
}