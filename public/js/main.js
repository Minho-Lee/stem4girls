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
  //var daysSpan = clock.querySelector('.days');
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    if ($username === "admin123") {
      adminMode = true;
    }
    
    t = getTimeRemaining(endtime);

    //daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
    //console.log('weeks: ' + weekCounter + ' / seconds: ' + secondsSpan.innerHTML + ' / ' + balance);
    if (t.total <= 0) {
      //console.log('before: ' + balance);
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
      if ((weekCounter === startWeek + 6) && (investCounter === true)) {
        if (investSuccess) {
          investUpdate.html("<h3>Investment Successful! You earned $" + investReturn + "</h3>");
          balanceUpdate('add', investReturn);
        } else {
          investUpdate.html("<h3>Invest Unsuccessful :( You lost your $100</h3>");
        } 
        investmentButton.disabled = false;
        investmentButton.innerHTML = "Submit Investment!";
        investCounter = false;
        $('#afterInvestSubmit').empty();
      } 

      //Check if the game is still going on (modify endWeek to change the ending)
      if (weekCounter === endWeek || adminMode === true) {
        $('#currentBalance, #housing, #food, #events, #investment-section, #foodExpense, \
            #houseExpense, #eventUpdate, #investmentUpdate, \
            #afterSubmit, #ownedItems').hide('slow', function() {
              //daysSpan.innerHTML = '0';
              hoursSpan.innerHTML = '00';
              minutesSpan.innerHTML = '00';
              secondsSpan.innerHTML = '00';
              weeksSpan.innerHTML = weekCounter;
              $(".salaryHide").slideUp('slow');
              //hiding login button in order to prevent users from logging in after the game finishes
              $("#loginbutton").hide();
            });
          if (investCounter === true) {
            $("#verbiage").html("<h4>Your investment of $100 came back because the game is over!");
            console.log('investreturn: ' + balance);
            balanceUpdate('add', 100);
          };

        console.log('gameover');
        $("#gameover")
          .html('<h1>Congrats! You finished the game with balance of <b>$' + Math.round(parseFloat(balance)*100) / 100 + '</b></h1>')
          .fadeIn(2000);

        $.ajax({
          type: "POST",
          url: 'submitbalance',
          data: { 
                'username' : $username,
                'balance' : Math.round(parseFloat(balance)*100) / 100
              }
          }).done(function(data) {
          if (data.status === 'success') {
            $.ajax({
              type: "POST",
              url: 'getrankings',
              data: { 'text' : 'username'},
              success: function(res, status, xhr) {
                console.log("success! Type: "+ xhr.getResponseHeader("content-type"));
                console.log("status: " + status);
                //console.log(JSON.stringify(res));
                var docs = res.players;
                for (var outer = 0; outer < docs.length; outer++) {
                  var name = docs[outer].username;
                  var maxbalance = docs[outer].session[0].balance;
                  for (inner = 0; inner < docs[outer].session.length; inner++) {
                    if (docs[outer].session[inner].balance > maxbalance) {
                      maxbalance = docs[outer].session[inner].balance;
                    }
                  }
                  player_array.push([0, name, maxbalance]);
                }
                $("#rankings").fadeIn('slow');
                var leaderboard = $("#leaderboard").DataTable({
                  'data': player_array,
                  'order': [[2, 'desc']],
                  'columns': [
                    { 'title': 'Rank' },
                    { 'title': 'Username' },
                    { 'title': 'Balance' }
                  ],
                  'columnDefs' :[{
                    'orderable': false,
                    'searchable': false,
                    'targets': [0,2]
                  }, {
                    'orderable' : false,
                    'searchable': true,
                    'targets' : [1]
                  }],
                  'paging': false
                });//DataTable end
                leaderboard.on( 'order.dt search.dt', function () {
                  leaderboard.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
                     cell.innerHTML = i + 1;
                  });
               }).draw();
              },
              error: function(xhr, textStatus, error) {
                console.log(xhr.statusText);
                console.log(textStatus);
                console.log(error); 
              }
            });//ajax done rankings
          }//done if statement
        })
        .fail(function(xhr, textStatus, err) {
          console.log(xhr.statusText);
          console.log(textStatus);
          console.log(err);
        });//ajax done submitbalance
      //end of if statement where it checks for if the game is over or not
      } else if ( weekCounter === event1 || weekCounter === event2 || weekCounter === event3) { 
        if (weekCounter === event1) {
          $("#event1").modal({
            toggle: true,
            backdrop: 'static',
            keyboard: false
          });
          $("#do1").click(function() {
            balanceUpdate('minus', 50);
            alert('You bought a gift! Deducting $50 from your balance. You have a fun birthday party with your friends!');
            currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
          });
          $("#dont1").click(function() {
            alert('You decided not to buy a gift! Your friend is sad but your balance remains the same!');
          });
        } else if (weekCounter === event2) {
          $("#event2").modal({
            toggle: true,
            backdrop: 'static',
            keyboard: false
          });
          $("#do2").click(function() {
            balanceUpdate('minus', 100);
            alert('You took your dog to the vet! Deducting $100 from your balance. Your dog is saved!');
            currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
          });
          $("#dont2").click(function() {
            alert('You decided not to take your dog to the vet! Your dog is limping but your balance remains the same!');
          });
        } else {
          $("#event3").modal({
            toggle: true,
            backdrop: 'static',
            keyboard: false
          });
          $("#do3").click(function() {
            balanceUpdate('minus', 50);
            alert('You paid the fine for your parking ticket! Deducting $50 from your balance');
            currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
          });
        }
        currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
        weeksSpan.innerHTML = weekCounter;
        //deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
        deadline= new Date(Date.parse(new Date()) + time);
        initializeClock('clockdiv', deadline);
      } else {
        currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
        weeksSpan.innerHTML = weekCounter;
        //deadline = new Date(Date.parse(new Date()) + 0.00006 * 24 * 60 * 60 * 1000);
        deadline= new Date(Date.parse(new Date()) + time);
        initializeClock('clockdiv', deadline);
      }
    //end if statement to see if t < 0 (10 seconds up)
    }
  }//updateClock
  
  updateClock();
  //this calls the updateClock() method every 1 second
  timeinterval = setInterval(updateClock, 1000);
    
}//initializeClock

//scroll to any given div
function goToByScroll(id){
  // Remove "link" from the ID
  id = id.replace("link", "");
  // Scroll
  $('html, body').animate({
      scrollTop: $("#"+id).offset().top},
      'slow');
}

/*  goToByScroll('weekdiv');

  hiding the salary section after a certain time
  var id = setInterval(function() {
    seconds++;
    if (seconds >= 5) {
      clearInterval(id);
      //alert('Total time: ' + seconds + ' seconds');
      var elems = document.querySelectorAll('.salaryHide');
      for (var i = 0; i < elems.length; ++i) {
        //elems[i].innerHTML = "";
        elems[i].style.display = "none";
      }
      $('#transition').html("<h1>Start!</h1>");
      seconds = 0;
    }
  }, 1000);
});*/

$("#foodSubmitButton").on('click', function() {
  $food = $(".foodbtn.toggleFood");
  if ($food.attr('id') === 'foodlow') {
    foodCost = 50;
  } else if ($food.attr('id') === 'foodmed') {
    foodCost = 100;
  } else if ($food.attr('id') === 'foodhigh') {
    foodCost = 150;
  } else {
    foodCost = -10;
  }

  if (foodCost > 0) {
    foodCounter = true;
    $("#foodoptions").fadeOut(2000);
    $("#afterFoodSubmit").html("<h4>Submitted!</h4>");
    foodExpense.html('<h3>Food option: ' + $food.attr('value') + 
                    ' / Food Expense: $' + foodCost+ '</h3>');
    if (foodCounter && houseCounter) {
      if (logged_in) {
        start();
      } else {
        alert('Please log in before starting the game!');
      }
    };
  } else {
    foodCounter = false;
    $("#afterFoodSubmit").html("<h4>Please select one of the options!");
  }
});

$("#houseSubmitButton").on('click', function() {
  $house = $(".housebtn.toggleHouse");
  if ($house.attr('id') === 'houselow') {
    houseCost = 100;
  } else if ($house.attr('id') === 'housemed') {
    houseCost = 200;
  } else if ($house.attr('id') === 'househigh') {
    houseCost = 300;
  } else {
    houseCost = -10;
  }

  if (houseCost > 0) {
    houseCounter = true;
    $("#houseoptions").fadeOut(2000);
    $("#afterHouseSubmit").html("<h4>Submitted!</h4>");
    houseExpense.html("<h3>House option: " + $house.attr('value') +
                      " / House Expense: $" + houseCost+ "</h3>");
    if (foodCounter && houseCounter) {
      if (logged_in) {
        start();
      } else {
        alert('Please log in before starting the game!');
      }
    };
  } else {
    houseCounter = false;
    $("#afterHouseSubmit").html("<h4>Please select one of the options!");
  }
});

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
    balanceUpdate('minus', 100);
    eventUpdate.html('<h3>You bought brand new shoes! Spent $100.</h3>');
    shoeCounter++;
    if (shoeCounter === 1) {
      $('#hideShoes').fadeIn(2000);
    } else {
      $('#multipleShoes').html('<h4> X ' + shoeCounter + '</h4>');
    }

  } else if(options.val() === 'option2') { 
    eventUpdate.html('<h3>You bought new jewelry! Spent $80.</h3>');
    balanceUpdate('minus', 80);
    ringCounter++;
    if (ringCounter === 1 ) {
      $("#hideRing").fadeIn(2000);
    } else {
      $("#multipleRings").html("<h4> X " + ringCounter + "</h4>");
    }
  } else if(options.val() === 'option3') {
    balanceUpdate('minus', 500);
    eventUpdate.html('<h3>You bought a brand new phone! Spent $500</h3>');
    phoneCounter++;
    if (phoneCounter === 1) {
      $('#hidePhone').fadeIn(2000);
    } else {
      $('#multiplePhones').html('<h4> X ' + phoneCounter + '</h4>');
    }
  } else if(options.val() === 'option4') {
    balanceUpdate('minus', 50);
    eventUpdate.html('<h3>You bought brand new clothes! Spent $50</h3>');
    dressCounter++;
    if (dressCounter === 1) {
      $("#hideDress").fadeIn(2000);
    } else {
      $("#multipleDresses").html("<h4> X " + dressCounter + "</h4>");
    }
  } else if(options.val() === 'option5') {
    eventUpdate.html('<h3>You bought a brand new purse! Spent $250</h3>');
    balanceUpdate('minus', 250);
    bagCounter++;
    if (bagCounter === 1) {
      $("#hidePurse").fadeIn(2000);
    } else {
      $("#multiplePurses").html("<h4> X " + bagCounter + "</h4>");
    }
  }

  ++i;
  if (i%2 === 0) {
    $('#afterEventSubmit').html('<h4>Event Submitted!</h4>');
  }
  else {
    $('#afterEventSubmit').html('<h4>Submitted Event!</h4>');  
  }
  currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');

  //adding owned item section
  $("#ownedItems").fadeIn(2000);
  //goToByScroll('hideShoes');

}

$('#investmentSubmit').click(function() {
  if (balance < 100) {
    $('#afterInvestSubmit').html('<h4>Not enough balance!</h4>');
  } else {
    startWeek = weekCounter;
    var investments = $('#investments');
    var investChoice = "";
    var randNum = Math.floor((Math.random() * 100) + 1);
    if (investments.val() === 'invest1') {
      balanceUpdate('minus', 100);
      investChoice = 'one';
      investSuccess = true;
      investReturn = 120;
    } else if (investments.val() === 'invest2') {
      balanceUpdate('minus', 100);
      investChoice = 'two';
      if (randNum <= 80) {
        investSuccess = true;
        investReturn = 150;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    } else if (investments.val() === 'invest3') {
      balanceUpdate('minus', 100);
      investChoice = 'three';
      if (randNum <= 60) {
        investSuccess = true;
        investReturn = 180;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    } else if (investments.val() === 'invest4') {
      balanceUpdate('minus', 100);
      investChoice = 'four';
      if (randNum <= 50) {
        investSuccess = true;
        investReturn = 200;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    } else if (investments.val() === 'invest5') {
      balanceUpdate('minus', 100);
      investChoice = 'five';
      if (randNum <= 30) {
        investSuccess = true;
        investReturn = 250;
      } else {
        investSuccess = false;
        investReturn = 0;
      }
    }
    investCounter = true;
    investUpdate.html('<h3>You chose investment option ' + investChoice + '! Balance of $100 deducted, result will show in 6 weeks!');
    investmentButton.disabled = true;
    investmentButton.innerHTML = "Invested!";
    $('#afterInvestSubmit').html('<h4>Submitted!</h4>');
    currentBalance.html('<h2>You currently have: $' + Math.round(parseFloat(balance)*100) / 100 + '</h2>');
  }
});

//load the window to the top once refreshed or reset
$(window).on('beforeunload', function(){
  $(window).scrollTop(0);
});

$(document).ready(function(){
  $("#rankings, #events, #investment-section, #ownedItems, \
    #hideShoes, #hideRing ,#hidePhone, #hideDress, #hidePurse, #gameover").hide();
  //initialHide.show();
  $('#friends').hide();
  $(window).scroll(function() {
    if (($('body').scrollTop() > 150) || (document.documentElement.scrollTop > 150)) {
      //$("#myBtn1").css("display", "block");
      $('#myBtn1').fadeIn(1000);
    } else {
      //$("#myBtn1").css("display", "none");
      $('#myBtn1').fadeOut(1000);
    };
  });
  //goToByScroll('weekdiv');

  //to toggle food and house buttons between clicked and non-cicked buttons
  $("#foodsubmit").find('button').on('click', function() {
    $('.foodbtn').not(this).removeClass('toggleFood').data('clicked', false);
    $(this).addClass('toggleFood').data('clicked', true);
    // console.log($(this).data('clicked'));
  });

  $("#housesubmit").find('button').on('click', function() {
    $(".housebtn").not(this).removeClass('toggleHouse').data('clicked', false);
    $(this).addClass('toggleHouse').data('clicked', true);
  });

  $('#myBtn1').on('click', function() {
    goToByScroll('main_container');
    $('body').scrollTop('0'); //For Chrome, Safari and Opera
    document.documentElement.scrollTop = 0; // For IE and Firefox
  });

  $("#myBtn2").on('click', function() {
    $('html, body').animate({
      scrollTop: $('#placeholder1').offset().top
    }, 2000);
  });
});//document.ready

$("#loginsubmit").on('click', function() {
  $username = $("#username").val();
  if ($username !== '') {
    logged_in = true;
    $("#loginbutton").hide();
    $("#loginsubmit").prop('disabled', true);
    $(".close").trigger('click');
    $.ajax({
      type: "POST",
      url: "insertUser",
      data: { 'username': $username },
      success: function(res, status, xhr) {
        console.log("success! Type: "+ xhr.getResponseHeader("content-type"));
        console.log("status: " + status);
        alert(res);
        if (foodCounter && houseCounter)
          start();
      },
      error: function(xhr, textStatus, error){
        console.log(xhr.statusText);
        console.log(textStatus);
        console.log(error);
      }
    });//ajax done
  };
});

$(function() {
    $('.confirm').click(function(e) {
        e.preventDefault();
        if (window.confirm("Are you sure?")) {
          location.reload();
          $(window).scrollTop(0);
        }
    });
});

//define a function that would initialize clock and start the game
var start = function() {
  $('#afterSubmit').html('<h3>Your bi-weekly salary is : $' + salaryValue + '</h3>').hide().slideDown(1500);
  currentBalance.fadeIn(2000).html('<h2>You currently have: $0</h2>').hide().slideDown(1500);
  $("#events, #investment-section").fadeIn(2000);
  deadline = new Date(Date.parse(new Date()) + time);
  initializeClock('clockdiv', deadline); 
};

var timeinterval, eventclick = false;
var player_array = [];
var adminMode = false, $username, submitbalance = false, logged_in = false;
var shoeCounter = 0, phoneCounter = 0, ringCounter = 0, dressCounter = 0, bagCounter = 0;
var seconds = 0;
var investmentButton = document.getElementById('investmentSubmit');
var initialHide = $('.initialHide');
var currentBalance = $('#currentBalance');
var foodExpense = $('#foodExpense');
var houseExpense = $('#houseExpense');
var eventUpdate = $('#eventUpdate');
var investUpdate = $('#investmentUpdate');
var houseCounter = false, foodCounter = false, investCounter = false;
var investSuccess = false;
var investReturn = 0;
var t = 0, i = 0;
var regexp = /^\d+\.?\d{0,2}$/;
var foodCost = 0, houseCost = 0;
var balance = 0;
var salaryValue = 1000; //fixed salary value
var weekCounter = 0;
var deadline = 0;
var event1 = 10, event2 = 26, event3 = 40;
var startWeek = 0, endWeek=52, time=10000;

