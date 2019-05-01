function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getGeneratorIndexByName(name) {
    var i = 0;
    while(i < generators.length) {
        if(name.toLowerCase() == generators[i].name.toLowerCase()) {
            return i;
        }
        i++;
    }
    return false;
}

function getUpgradeIndexByCostAndAffection(cost, affect) {
    var i = 0;
    while(i < upgrades.length) {
        if(affect.toLowerCase() == upgrades[i].affect.toLowerCase() && cost == upgrades[i].cost) {
            return i;
        }
        i++;
    }
    return false;
}

function buyGenerator(name) {
    var g = getGeneratorIndexByName(name);
    if(g !== false) {
        if(generators[g].amount < 99) {
            if(gold >= generators[g].cost) {
                gold -= generators[g].cost;
                Tspent += parseFloat(generators[g].cost);
                refreshNumbers();
                generators[g].amount++;
                generators[g].cost *= 1.20;
                    if(generators[g].cost > 99) {
                        generators[g].cost = Math.round(generators[g].cost);
                    } 
                    else {
                        generators[g].cost = generators[g].cost.toFixed(1);
                    }
                success('You successfully bought the generator ' + name + '!');
                spawnGenerators();
            } 
        else if(gold < generators[g].cost) {
            error("Not enough money!");
        }   
        }
        else {
            error('Sorry, but you can not buy more generators of this kind');
        }
    }
}

function buyUpgrade(cost, affect) {
    var u = getUpgradeIndexByCostAndAffection(cost, affect);
    if(u !== false) {
        if(upgrades[u].status === false) {
            if(gold >= upgrades[u].cost) {
                gold -= upgrades[u].cost;
                Tspent += upgrades[u].cost;
                refreshNumbers();
                upgrades[u].status = true;
                if(upgrades[u].effect == "x") {
                    if( (generators[getGeneratorIndexByName(upgrades[u].affect)].GPS * upgrades[u].amount) > 9999 ) {
                        error('To much m8!');
                    } 
                    else {
                        generators[getGeneratorIndexByName(upgrades[u].affect)].GPS *= upgrades[u].amount;
                    }
                }
                else if(upgrades[u].effect == "+") {
                    if ((generators[getGeneratorIndexByName(upgrades[u].affect)].GPS + upgrades[u].amount ) > 9999  ) {
                        error('To much m8!');
                    }
                    else {
                        generators[getGeneratorIndexByName(upgrades[u].affect)].GPS += upgrades[u].amount;
                    }

                }

            }
            else if(gold < upgrades[u].cost) {
                console.log('You do not have the money for it!');
            }
        } 
        else if(upgrades[u].status === true) {
            console.log('This Upgrade has already been purchased!');
        }
    }
}

function resetGame() {
    document.cookie = "time=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "gold=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "generators=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "upgrades=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "Tgold=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "Tclicks=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "Tspent=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    reset = true;
    location.reload();
}

function getTimeBetweenLastSession() {
    if(getCookie('time') != "") {
        var x = new Date();
        z =  x.getTime() - parseInt(getCookie('time'));
        z /= 1000;
        return Math.round(z);
    } else {
        return 1;
    }
    
}

function getGPS() {
    var g = 0;
    for(i = 0; i < generators.length; i++) {
        g += generators[i].GPS * generators[i].amount;
    }
    return g;
}

function addGenerator(name, cost, GPS, IMG) {
    generators.push({name: name, cost: cost, GPS: GPS, amount: 0, sGPS: GPS, IMG: IMG});
}

function addUpgrade(affect, cost, effect, amount) {
    upgrades.push({affect: affect, cost: cost, effect: effect, amount: amount, status: false});
}

function removeGenerator(name) {
    x = getGeneratorIndexByName(name);
    if(x !== false) {
        generators.splice(x, 1);
        var i = 0;
        while(i < upgrades.length) {
            if(upgrades[i].affect.toLowerCase() == name.toLowerCase()) {
                upgrades.splice(i, 1);
                i = 0;
            }
            i++;
        }
        success(name + ' is now removed!');
    } 
    else if(x === false) {
        error("There is no generator named " + name);
    }
}

function removeUpgrade(cost, affect) {
    x = getUpgradeIndexByCostAndAffection(cost, affect);
    if(x !== false) {
        upgrades.splice(x, 1);
        success(' The upgrade is now removed!');
    } 
    else if(x === false) {
        error("There is no upgrade with that cost and affect");
    }    
}

function spawnGenerators() {
    sortArrays();
    $('#store_generators').empty();
    for(var i = 0; i < generators.length; i++) {
        $('#store_generators').append('<div><img alt="A image of the generator ' + generators[i].name + '" src="' + generators[i].IMG + '"> <div class="store_generators_name"><h4>' + generators[i].name + '</h4></div><div class="store_generators_stats"><p>Cost: '+ displayNumberStore(generators[i].cost) + '</p><p>GPS: ' + displayNumberStore(generators[i].GPS) + '</p> </div> <div class="store_generators_amount">' + generators[i].amount +'</div> </div>');
    }
    $('#store_generators div').click(function() {
        buyGenerator($(this).find('.store_generators_name h4').text());
    });
}

function spawnUpgrades() {
    sortArrays();
    $('#store_upgrades').empty();
    for(var i = 0; i < upgrades.length; i++) {
        if(! upgrades[i].status) {
            $('#store_upgrades').append('<div cost="' + upgrades[i].cost + '" affect= "' +  upgrades[i].affect + '" style="background: url(\' ' + generators[getGeneratorIndexByName(upgrades[i].affect)].IMG + '\'); background-size:100% 100%;"> <p>'+ displayNumberStore(upgrades[i].amount) + upgrades[i].effect + '</p> <p>' + displayNumberStore(upgrades[i].cost) + '</p> </div>');
        }
    }
    $('#store_upgrades div').click(function() {
        var cost = $(this).attr("cost");
        var affect = $(this).attr("affect");
        if(gold >= cost) {
            buyUpgrade(cost, affect);
            spawnGenerators();
            $(this).fadeOut(1000, function() {
                $(this).remove();
            });
        } 
        else {
            error("Not enough money");
        }
    });

}

function sortArrays() {
    function compare(a, b) {
        if (a.cost < b.cost) {
            return -1;
        }
        if (a.cost > b.cost) {
            return 1;
        }
        return 0;
    }
    generators.sort(compare);
    upgrades.sort(compare);
}

function displayNumber(number) {
    if(number >= 1000000000) {
        return Math.round( (number / 1000000000) * 10 ) / 10 + 'b';
    }
    else if(number >= 1000000) {
        return Math.round( (number / 1000000) * 10 ) / 10 + 'm';
    }
    return Math.floor(number);
}

function displayNumberStore(number) {
    if(number >= 1000000) {
        return Math.round( (number / 1000000) * 10 ) / 10 + 'm';
    }
    else if(number >= 1000) {
        return Math.round((number / 1000)) + 'k';
    } 
    else {
        return Math.round( number * 10 ) / 10;;
    }
}

var message_state = true;

function message(text, color) {
    if(message_state === true) {
        $('#message').css('background', color);
        $('#message p').text(text);
        $('#message').stop().toggle("slide", { direction: "right" });
        message_state = false;
        setTimeout(function() {
            $('#message').stop().toggle("slide", { direction: "right" });
            setTimeout(function() {
                message_state = true;
            }, 2000);
        }, 4000);
    }
}

function success(text) {
    message(text, 'green')
}

function error(text) {
    message(text, 'red');
}

function refreshNumbers() {
    $('#gold').text(displayNumber(gold));
    $('#GPS').text(displayNumberStore(getGPS()));
    $('#Tgold').text(displayNumberStore(Tgold));
    $('#Tclicks').text(Tclicks);
    $('#Tspent').text(displayNumberStore(Tspent));   
}

if(getCookie('gold') != "") {
    gold = parseInt(getCookie('gold'));
}
else {
    gold = 0;
}
if(getCookie('Tgold') != "") {
    Tgold = parseInt(getCookie('Tgold'));
}
else {
    Tgold = 0;
}
if(getCookie('Tclicks') != "") {
    Tclicks = parseInt(getCookie('Tclicks'));
}
else {
    Tclicks = 0;
}
if(getCookie('Tspent') != "") {
    Tspent = parseInt(getCookie('Tspent'));
}
else {
    Tspent = 0;
}
if(getCookie('generators') != "") {
    generators = JSON.parse(getCookie("generators"));
} 
else {
    generators = new Array();
    addGenerator('Triangle', 15, 0.1, './img/triangle.png');
    addGenerator('Square', 100, 0.5, './img/square.png');
    addGenerator('Pentagon', 500, 4, './img/pentagon.png');
    addGenerator('Hexagon', 3000, 10, './img/hexagon.png');
    addGenerator('Heptagon', 10000, 40, './img/heptagon.png');
    addGenerator('Octagon', 40000, 100, './img/octagon.png');
    addGenerator('Nonagon', 200000, 400, './img/nonagon.png');
    addGenerator('Docagon', 1600000, 6666, './img/docagon.png');
    
}
if(getCookie('upgrades') != "") {
    upgrades = JSON.parse(getCookie("upgrades"));
} 
else {
    upgrades = new Array();
    addUpgrade('Triangle', 40, '+', 0.6);
    addUpgrade('Square', 500, '+', 0.3);
    addUpgrade('Square', 1000, 'x', 2);
    addUpgrade('Pentagon', 5000, '+', 1);
    addUpgrade('Pentagon', 10000, 'x', 2);
    
}
if(getCookie('time') != "") {
    gold += getGPS() * getTimeBetweenLastSession();
}

var reset = false;

setInterval(function() {
    gold += getGPS();
    Tgold += getGPS();
    refreshNumbers();
}, 1000);

$(window).unload(function() {
    if(reset !== true) {
        var time = new Date();
        setCookie("time", time.getTime(), 365);
        setCookie("gold", gold, 365);
        setCookie("Tgold", Tgold, 365);
        setCookie("Tclicks", Tclicks, 365);
        setCookie("Tspent", Tspent, 365);
        setCookie("generators", JSON.stringify(generators), 365);
        setCookie("upgrades", JSON.stringify(upgrades), 365);
    }
});

// Display

$(document).ready(function() {
    spawnGenerators();
    spawnUpgrades();
    refreshNumbers();
    
    $('.info_button').hover(function() {
        $(this).find('svg path').first().css('fill', '#D6D6D8');
        $(this).find('svg path').css('stroke', '#D6D6D8');
    }, function() {
        $(this).find('svg path').first().css('fill', '#a5a7ac');
        $(this).find('svg path').css('stroke', '#a5a7ac');
    });
    
    $('#options').click(function() {
        $('#info h1').text('Options');
        $('#info_stats').css('display', 'none');
        $('#info_copyright').css('display', 'none');
        $('#info_options').css('display', 'block');
    });
    $('#stats').click(function() {
        $('#info h1').text('Stats');
        $('#info_copyright').css('display', 'none');
        $('#info_options').css('display', 'none');
        $('#info_stats').css('display', 'block');
    });
    $('footer p').click(function() {
        $('#info h1').text('Copyright');
        $('#info_stats').css('display', 'none');
        $('#info_options').css('display', 'none');
        $('#info_copyright').css('display', 'block');
    });
    
    $('button[name="generator"]').click(function() {
        if ($('input[name="generator_name"]').val() == "") {
            error('Your generator needs a name!');
        } 
        else if ($('input[name="generator_cost"]').val() == "") {
            error('Your generator needs a price!');
        } 
        else if($('input[name="generator_GPS"]').val() == "") {
            error('Your generator needs a GPS (Gold Per Second)');
        }
        else if($('input[name="generator_IMG"]').val() == "") {
            error('Please add a picture!');
        }
        else {
            if(getGeneratorIndexByName($('input[name="generator_name"]').val()) !== false) {
                error('That name is taken!');
            } 
            else if(isNaN($('input[name="generator_cost"]').val()) ) {
                error('The price needs to be a number!');
            }
            else if(isNaN($('input[name="generator_GPS"]').val()) ) {
                error('The GPS needs to be a number!');
            }
            else {
                success($('input[name="generator_name"]').val() + ' is now added!');
                addGenerator($('input[name="generator_name"]').val(), $('input[name="generator_cost"]').val(), $('input[name="generator_GPS"]').val(), $('input[name="generator_IMG"]').val());
                spawnGenerators();
                $('input[name="generator_name"]').val("");
                $('input[name="generator_cost"]').val("");
                $('input[name="generator_GPS"]').val("");
                $('input[name="generator_IMG"]').val("");
            }
        }
    });
    
    $('button[name="upgrade"]').click(function() {
        if ($('input[name="upgrade_affect"]').val() == "") {
            error('Your upgrade needs a name!');
        } 
        else if ($('input[name="upgrade_cost"]').val() == "") {
            error('Your upgrade needs a price!');
        } 
        else if ($('input[name="upgrade_amount"]').val() == "") {
            error('Your upgrade needs an amount!');
        } 
        else {
            if(getGeneratorIndexByName($('input[name="upgrade_affect"]').val()) === false) {
                error("There is no generator named " + $('input[name="upgrade_affect"]').val());
            } 
            else if(isNaN($('input[name="upgrade_cost"]').val())) {
                error('The cost needs to be a number!');
            }
            else if(isNaN($('input[name="upgrade_amount"]').val())) {
                error('The amount needs to be a number!');
            }
            else {
                var x = true;
                for(var i = 0; i < upgrades.length; i++) {
                    if(upgrades[i].affect.toLowerCase() == $('input[name="upgrade_affect"]').val().toLowerCase() && upgrades[i].cost == parseFloat($('input[name="upgrade_cost"]').val()) ) {
                        error('Two upgrades can not have the same cost and affection!');
                        x = false;
                    }
                }
                if (x) {
                    success('Your upgrade is now added!');
                    addUpgrade($('input[name="upgrade_affect"]').val(), $('input[name="upgrade_cost"]').val(), $('input[name="upgrade_effect"]:checked').val(), $('input[name="upgrade_amount"]').val());
                    spawnUpgrades();
                    $('input[name="upgrade_affect"]').val("");
                    $('input[name="upgrade_cost"]').val("");
                    $('input[name="upgrade_amount"]').val("");
                }
            }
        }
    });
    $('input[value="generator"]').click(function() {
        $('input[name="remove_input_cost"]').css('display', 'none');
        $('input[name="remove_input_affect"]').attr("placeholder", "name");
    });
    
    $('input[value="upgrade"]').click(function() {
        $('input[name="remove_input_cost"]').css('display', 'block');
        $('input[name="remove_input_affect"]').attr("placeholder", "affect");
    });
    
    $('button[name="remove"]').click(function() {
        if($('input[name="remove_text"]:checked').val() == "generator") {
            if ($('input[name="remove_input_affect"]').val() != "") {
                removeGenerator($('input[name="remove_input_affect"]').val());
                spawnGenerators();
                spawnUpgrades();
                $('input[name="remove_input_affect"]').val("");
            } 
            else {
                error("Please enter something!");
            }
        }
        else if($('input[name="remove_text"]:checked').val() == "upgrade") {
            if ($('input[name="remove_input_affect"]').val() != "" && $('input[name="remove_input_cost"]').val() != "") {
                removeUpgrade($('input[name="remove_input_cost"]').val(), $('input[name="remove_input_affect"]').val());
                spawnGenerators(); 
                spawnUpgrades();
                $('input[name="remove_input_affect"]').val("");
                $('input[name="remove_input_cost"]').val("");
    
            } 
            else {
                error("Please enter something!");
            }
        }
    });
     if (window.matchMedia('(max-width: 554px)').matches) {
        $('#the_click').click(function() {
            $('#the_click').stop().animate({
                width: "25%", 
                height: "30%",
                marginTop: "5%"
            }, 100, function() {
                $(this).animate({
                    width: "30%", 
                    height: "40%",
                    marginTop: "2%" 
                }, 100);
            });
        });
    }    
    else if (window.matchMedia('(max-width: 1099px)').matches) {
        $('#the_click').click(function() {
            $('#the_click').stop().animate({
                width: "15%", 
                height: "40%",
                marginTop: "5%"
            }, 100, function() {
                $(this).animate({
                    width: "20%", 
                    height: "50%",
                    marginTop: "2%" 
                }, 100);
            });
        });
    } 
    else if (window.matchMedia('(max-width: 1920px)').matches) {
        $('#the_click').click(function() {
            $('#the_click').stop().animate({
                width: "45%", 
                height: "20%",
                marginTop: "11%"
            }, 100, function() {
                $(this).animate({
                    width: "50%", 
                    height: "25%",
                    marginTop: "8%" 
                }, 100);
            });
        });   
    }
    
    $('#the_click').click(function() {
        gold++;
        Tgold++;
        Tclicks++;
        refreshNumbers();
        $('body').append('<p class="the_click_add" style="left:' + (event.clientX + (Math.random() * 15 ) - (Math.random() * 15 ))  + 'px;top: ' + event.clientY +'px;">' + '+1' + '</p>');
        $('.the_click_add').stop().animate({
            top: (event.clientY - 70).toString() + 'px',
            opacity: 0.0
        }, 500, function() {
            $(this).remove();
        });
        
    });
    
});