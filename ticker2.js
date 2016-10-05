
var theTravel;
var speed = 0;
var velocity = 0.1;
var div = $(".link-box").length;
var horizon = div * 65;
function travel(){
    var tracker = 0;
    var position;
    $(".link-box").each(function(){
        position = horizon/2 - ((tracker + speed) % horizon);
        if (position < -horizon/2){
            position = position + horizon;
        }

        $(this).css({left: position + "%"});
        tracker += 65;
    });
    speed += velocity;
    theTravel = window.requestAnimationFrame(travel);
}


function stopTravel() {
    cancelAnimationFrame(theTravel);
}

$('.link-box').on('mouseover', stopTravel).on('mouseout', travel);
travel();
