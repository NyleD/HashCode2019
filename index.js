var deltaAvgFactor = 0.5;
var intersectionFactor = 0.5;


var Hpics = [];
var Vpics = [];
var totalPics = 0;
var picsObj = [];
var init;
var avgTags = 0;
var slides = [];
var openFile = function (event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        init = text;
        init = init.split('\n');
        //mediator();
        parseInput();
        combineVerticle();
        var gridScore = createScoreGridForSlides(); 
        var totalscore = getSlidesList(gridScore);
        console.log(picsObj);
        output();
        console.log(slides);
        console.log("totalscore: " + totalscore); 
    };
    reader.readAsText(input.files[0]);
};
function parseInput() {
    totalPics = init[0];
    var totalCounter = 0;
    var hCounter = 0;
    var vCounter = 0;
    init.splice(0, 1);
    init.forEach(function (e) {
        var obj = e.split(' ');
        var align = obj[0];
        var numTags = parseInt(obj[1]);
        avgTags += numTags;
        var tags = [];
        for (var i = 0; i < numTags; i++) {
            tags.push(obj[i + 2]);
        }
        var realObj = { 'id': [totalCounter], 'align': align, 'totalTags': numTags, 'tags': tags, 'deleted': false , 'left' : [], 'right' : []};
        picsObj.push(realObj);
        if (realObj.align == 'H') {
            Hpics.push(realObj);
            hCounter++;
        }
        if (realObj.align == 'V') {
            Vpics.push(realObj);
            vCounter++;
        }
        totalCounter++;
    });
    avgTags = avgTags / totalPics;
    picsObj.sort(function (a, b) {
        var y = a.totalTags; var x = b.totalTags;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    Hpics.sort(function (a, b) {
        var y = a.totalTags; var x = b.totalTags;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    Vpics.sort(function (a, b) {
        var y = a.totalTags; var x = b.totalTags;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    console.log(picsObj);
}

function getOurScore(a, b) {
    var union = unionTags(a, b).length;
    var int = intersectionTags(a, b).length;
    var deltaAvg = Math.abs(union - avgTags);
    return deltaAvgFactor * deltaAvg - intersectionFactor * int;
}

function combineVerticle() {
    var tempHpics = Hpics;
    console.log(Vpics);
    for (var i = 0; i < Vpics.length; i++) {
        if (Vpics[i].deleted == false) {
            var maxScoreId = i;
            var maxScore = 0;
            var firstFlag = true;
            for (var j = i + 1; j < Vpics.length; j++) {
                if(Vpics[j].deleted == false){
                    if (firstFlag) {
                        maxScore = getOurScore(Vpics[i], Vpics[j]);
                        maxScoreId = j;
                        firstFlag = false;
                    } else {
                        var curScore = getOurScore(Vpics[i], Vpics[j]);
                        if (curScore > maxScore) {
                            maxScore = curScore;
                            maxScoreId = j;
                        }
                    }
                }
                
            }
            var combineObj = { 'id': [Vpics[i].id[0], Vpics[maxScoreId].id[0]], 'align': 'V', 'totalTags': unionTags(Vpics[i], Vpics[maxScoreId]).length, 'tags': unionTags(Vpics[i], Vpics[maxScoreId]), 'left' : [], 'right' : [] };
            Vpics[i].deleted = true;
            Vpics[maxScoreId].deleted = true;
            tempHpics.push(combineObj);
        }

    }
    tempHpics.sort(function (a, b) {
        var y = a.totalTags; var x = b.totalTags;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    picsObj = tempHpics;
    console.log(picsObj);
    console.log(createScoreGridForSlides());
}

function unionTags(a, b) {
    union = a.tags.slice();

    b.tags.forEach(i => { if (union.indexOf(i) == -1) union.push(i) });
    return union;
}

function intersectionTags(a, b) {
    intersection = a.tags.filter(i => b.tags.indexOf(i) !== -1);
    return intersection;
}

function inAnotB(a, b) {
    res = a.tags.filter(i => b.tags.indexOf(i) == -1);
    return res;
}

function realScore(a, b) {
    intersectionSize = intersectionTags(a, b).length;
    inAnotBSize = inAnotB(a, b).length;
    inBnotASize = inAnotB(b, a).length;

    res = intersectionSize < inAnotBSize ? intersectionSize : inAnotBSize;
    return res < inBnotASize ? res : inBnotASize;
}

function create2DArray(rows) {
    var arr = [];
  
    for (var i=0;i<rows;i++) {
       arr[i] = [];
    }
  
    return arr;
  }

function createScoreGridForSlides() {
    len = picsObj.length;
    grid = create2DArray(len);

    for(i = 0; i < len; i++) {
        for (j = 0; j < len; j++) {
            if (i !== j) {
                obj1 = picsObj[i];
                obj2 = picsObj[j];

                let score = realScore(obj1, obj2);
                grid[i][j] = score;
            } else {
            	grid[i][j] = -1;
            }
        }
    }

    return grid;
}


function getSlidesList(gridScore) {

var len = picsObj.length - 1; 
var totalscore = 0; 

var curr = 0; 
while (1) {

    // Getting two max object to connect
    var maxobj = maxElement(gridScore[0]);
    var maxIndex1 = 0;

    for (var s = 1; s < gridScore.length; s++) {
        var obj = maxElement(gridScore[s], s); 
        if (obj["max value"] > maxobj["max value"]) {
            maxIndex1 = s; 
            maxobj = obj;  
        }
    }

    // have maxIndex1 and maxobj.maxIndex2
    // Adding the id's 1
    if(maxobj["max value"]  >= 0 && curr < len) { 
    var slide1 = picsObj[maxIndex1]
    var slide2 = picsObj[maxobj["maxIndex2"]]
    if(slide1["left"].length == 0 && slide2["right"].length == 0) {
        slide1["left"] = slide2["id"];
        slide2["right"] = slide1["id"];
         gridScore[maxIndex1][maxobj["maxIndex2"]] = -1; 
         gridScore[maxobj["maxIndex2"]][maxIndex1] = -1; 
         curr++;
         totalscore += maxobj["max value"]; 
    } else if (slide1["right"].length == 0 && slide2["left"].length == 0) {
        slide1["right"] = slide2["id"]; 
        slide2["left"] = slide1["id"]; 
         gridScore[maxIndex1][maxobj["maxIndex2"]] = -1; 
         gridScore[maxobj["maxIndex2"]][maxIndex1] = -1; 
         curr++; 
         totalscore += maxobj["max value"]; 
    } else {
        
        for(var i = 0; i<gridScore.length; i++){
        	gridScore[maxIndex1][i] = -1;
        	gridScore[i][maxIndex1] = -1;
        }
    }
    
} else {
    return totalscore;  
}

/*
  // give -1 values
  gridScore[maxIndex1][maxobj["maxIndex2"]] = -1; 
  gridScore[maxobj["maxIndex2"]][maxIndex1] = -1; 
  

  for (var s = 1; s < picsObj.length; s++) {
  if(negativeOneCheck(gridScore[s] == true)) {
    gridScore.splice(s,1); 
  }
*/
}
console.log(picsObj);
}

function maxElement(arr, index) {
    if (arr == undefined || arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max && index != i) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return { 'maxIndex2' : maxIndex, 'max value' : max }
}
function output() {
    
    for(var i = 0; i < picsObj.length; i++){
        if(picsObj[i].right.length !=0 && picsObj[i].left.length == 0){
            slides.push(picsObj[i].id);
            slides.push(picsObj[i].right);
            break;
        }
    }
    if(slides.length != 0) helperOutput();
    
}
function helperOutput(){
    var flag = true;
    var rightObj = picsObj.find(function(e){
    if(JSON.stringify(e.id) === JSON.stringify(slides[slides.length-1])) return true;
    else return false;
   });
   if(rightObj != null && rightObj.right.length != 0){
       slides.push(rightObj.right);
       helperOutput();
   }
}
