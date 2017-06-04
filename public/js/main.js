function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);
  var daysSpan = clock.querySelector('.days');
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    var t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total < 0) {
      clearInterval(timeinterval);
      var weeks = document.getElementById('weekdiv');
      var weeksSpan = weeks.querySelector('.weeks');
      weekCounter += 1;
      balanceUpdate(salaryValue);
      weeksSpan.innerHTML = weekCounter;
      var reset = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
      initializeClock('clockdiv', reset);
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

function submitSalary(){
  var salary = document.getElementById('salary');
  //var salaryShow = document.getElementById('salaryShow');
  if (isNaN(salary.value)) {
    $('#afterSubmit').html('<h3>Invalid Entry! Please Enter A Number!</h3>');
  } else {
    var regexp = /^\d+\.?\d{0,2}$/;
    if (regexp.test(salary.value) === true) {
      salary.disabled = true;
      salaryValue = salary.value;
      $('#afterSubmit').html('<h3>Your bi-weekly salary is : $' + salaryValue + '</h3>');
      $('#salaryIncrease').html('<h3>You currently have: $0</h3>');
      //balanceUpdate(salaryValue);
      salary.value = "Entered!";
      var deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
      initializeClock('clockdiv', deadline);  
    } else {
      $('#afterSubmit').html('<h3>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h3>');
    }
    
  }
  //console.log($("#salary").val()); 
}

function balanceUpdate(moneyVal) {
  balance += parseFloat(moneyVal);
  $('#salaryIncrease').html('<h3>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h3>');
}

var balance = 0;
var salaryValue = 0;
var weekCounter = 0;