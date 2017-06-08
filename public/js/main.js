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
    t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total < 0) {
      clearInterval(timeinterval);
      var weeks = document.getElementById('weekdiv');
      var weeksSpan = weeks.querySelector('.weeks');
      weekCounter += 2;
      balanceUpdate('add', salaryValue);
      if (foodCounter === true) {
        balanceUpdate('minus', foodCost);
      }
      if (houseCounter === true) {
        balanceUpdate('minus', houseCost);
      }
      currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
      weeksSpan.innerHTML = weekCounter;
      deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
      initializeClock('clockdiv', deadline);
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}

function submitSalary(){
  var salary = document.getElementById('salary');
  var submitButton = document.getElementById('submitSalary');
  var hideFood = document.getElementById('hideFood');
  if (isNaN(salary.value)) {
    $('#afterSubmit').html('<h3>Invalid Entry! Please Enter A Number!</h3>');
  } else {
    if (regexp.test(salary.value) === true) {
      submitButton.disabled = true;
      submitButton.innerHTML = "Submitted!"
      hideFood.style.visibility = "visible";
      salary.disabled = true;
      salaryValue = salary.value;
      $('#afterSubmit').html('<h3>Your bi-weekly salary is : $' + salaryValue + '</h3>');
      currentBalance.html('<h2>You currently have: $0</h2>');
      salary.value = "Entered!";
      deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
      initializeClock('clockdiv', deadline);  
    } else {
      $('#afterSubmit').html('<h3>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h3>');
    }
    
  }
  //console.log($("#salary").val()); 
}

function submitFood() {
  foodCost = $('#foodCost').val();
  foodSubmit = $('#foodSubmitButton');
  if (isNaN(foodCost)) {
    $('#afterFoodSubmit').html('<h4>Invalid Entry! Please Enter A Number!</h4>');
    foodCounter = false;
  } else {
    $('#afterFoodSubmit').html('<h4>Submitted!</h4>');
    if (regexp.test(foodCost) === true) {
      foodCounter = true;
      foodExpense.html('<h3>Food Expense: $' + foodCost+ '</h3>');
    } else {
      $('#afterFoodSubmit').html('<h4>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h4>');
      foodCounter = false;
    }
  }
}

function submitHouse() {
  houseCost = $('#houseCost').val();
  houseSubmit = $('#houseSubmitButton');
  if (isNaN(houseCost)) {
    $('#afterHouseSubmit').html('<h4>Invalid Entry! Please Enter A Number!</h4>');
    houseCounter = false;
  } else {
    $('#afterHouseSubmit').html('<h4>Submitted!</h4>');
    if (regexp.test(houseCost) === true) {
      houseCounter = true;
      houseExpense.html('<h3>House Expense: $' + houseCost+ '</h3>');
    } else {
      $('#afterHouseSubmit').html('<h4>Invalid Entry! Please Enter A Valid Number! (XXX.XX format)</h4>');
      houseCounter = false;
    }
  }

}

function balanceUpdate(action, moneyVal) {
  if (action === 'add') {
    balance += Math.round(parseFloat(moneyVal)*100) / 100;
  } else if (action === 'minus') {
    balance -= Math.round(parseFloat(moneyVal)*100) / 100;
  }
}

function optionSubmit() {
  var options = $('#options');
  if (options.val() === 'option1') {
    balanceUpdate('minus', 200);
    eventUpdate.html('<h3>You bought brand new shoes! Spent $200.</h3>');
  } else if(options.val() === 'option2') { 
    salaryValue = salaryValue * 0.8;
    eventUpdate.html('<h3>You changed jobs! Decrease salary by 20%.</h3>');
    $('#afterSubmit').html('<h3>Your bi-weekly salary is : $' + Math.round(parseFloat(salaryValue)*100) / 100 + '</h3>');
  } else if(options.val() === 'option3') {
    balanceUpdate('minus', 500);
    eventUpdate.html('<h3>You bought a brand new phone! Spent $500</h3>');
  } else if(options.val() === 'option4') {
    balanceUpdate('add', 1000);
    eventUpdate.html('<h3>You won a lottery! Gained $1000</h3>');
  } else if(options.val() === 'option5') {
    eventUpdate.html('<h3>Nothing happened</h3>');
    //do nothing
  }
  currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
}

var currentBalance = $('#currentBalance');
var foodExpense = $('#foodExpense');
var houseExpense = $('#houseExpense');
var eventUpdate = $('#eventUpdate');
var houseCounter = false, foodCounter = false;
var t = 0;
var regexp = /^\d+\.?\d{0,2}$/;
var foodCost, houseCost = 0;
var balance = 0;
var salaryValue = 0;
var weekCounter = 0;
var deadline = 0;