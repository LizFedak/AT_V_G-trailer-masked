var options = {
  valueNames: [ 'mobilename', { attr: 'src', name: 'mobileimage'}, {attr:'href', name: 'mobileitem_url'}, 'mobileprice', 'mobilemake', 'mobileyear', 'mobiletype', 'mobileavailability','mobilelength','mobileid','mobilecondition' ],
item: `<li>
<div class="mobile-trailer-card">
<div class="mobile-trailer-left">
  <img class="mobileimage mobile-trailer-image" alt="Image of a trailer that is for sale" width="540" height="360">
</div>
<div class="mobile-trailer-right">
  <div class="mobile-trailer-right-firstrow">
    <p class="mobilename mobile-trailer-name"></p>
  </div> 
<div class="mobile-trailer-right-secondrow">
  <div class="mobile-trailer-right-secondrow-firstCol">
   <p>Condition: <span class="mobilecondition"></span></p>
   <p>Size: <span class="mobilelength"></span></p>
   <p>Make: <span class="mobilemake"></span></p>
    <p>Type: <span class="mobiletype"></span></p>
  </div>
</div>
<div class="mobile-trailer-right-thirdRow">
    <p class="mobile-trailer-price">$<span class="mobileprice mobile-trailer-price"></span></p>
    <a class="mobileitem_url mobile-viewSpecs">View Details</a>
  </div>
</div>
</div>
</li>`,
pagination: true,
page: 5
};

// Create an object from the data.config array 
var values = data.config.mobiletrailers;


// Update the item URL and the ID
values.forEach(obj => {
  obj.mobileid = obj.mobileitem_url;
  let new_page_item_url = `https://tricornerstrailers.com/our-trailers/${obj.mobileitem_url}`;
  obj.mobileitem_url = new_page_item_url;
});


// Create the LIST JS new list object
var mobileItemList = new List('mobile-trailers', options, values);
// console.log(mobileItemList);

// Creates methods to be used with the filters using OLOO pattern
const mobilefilters = {
  clearAll() {
    this.types = [];
    this.makes = [];
    this.makeConditionFalse();
    this.makeAvailabilityFalse();
    this.updateMaxPrice(1000000);
    var checkBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    // console.log(checkBoxes);
    checkBoxes.forEach(x => x.checked = false);
    $('#mobile-priceFilter option[value=100000]').attr('selected','selected');
    mobileItemList.filter();
    // console.log(mobilefilterObject);
  },
  addType(type) {
    this.types.push(type);
    return this;
  },
  removeType(type) {
    this.types.splice(this.types.indexOf(type), 1);
    return this;
  },
  addMake(make) {
    this.makes.push(make);
    return this;
  },
  removeMake(make) {
    this.makes.splice(this.makes.indexOf(make), 1);
    return this;
  },
  makeConditionTrue() {
    this.condition = true;
  },
  makeConditionFalse() {
    this.condition = false;
  },
  makeAvailabilityTrue() {
    this.availability = true;
  },
  makeAvailabilityFalse() {
    this.availability = false;
  },
  updateMaxPrice(val) {
    this.maxPrice = val;
  }
}

function mobilefilterMaker() {  
  return Object.assign({
    types: [],
    makes: [],
    condition: false,
    availability: false,
    maxPrice: 100000
  }, mobilefilters);
}

let mobilefilterObject = mobilefilterMaker();
// console.log(mobilefilterObject, "filter object");

$('input.mobilemakes:checkbox').change(function() {
  if (this.checked) {
    console.log(this.value);
    mobilefilterObject.addMake(this.value);
    console.log(mobilefilterObject.makes);
  } else {
    mobilefilterObject.removeMake(this.value);
}
DOMOBILEFILTERING();
});


$('input.mobiletypes:checkbox').change(function() {
if (this.checked) {
  console.log(this.value);
  mobilefilterObject.addType(this.value);
  console.log(mobilefilterObject.types);
} else {
  mobilefilterObject.removeType(this.value);
}
DOMOBILEFILTERING();
});


$('input.mobilecondition:checkbox').change(function() {
if (this.checked) {
  console.log(this.value);
  mobilefilterObject.makeConditionTrue();
  console.log(mobilefilterObject);
} else {
    mobilefilterObject.makeConditionFalse();
}
DOMOBILEFILTERING();
});


$('input.mobileavailability:checkbox').change(function() {
if (this.checked) {
  console.log(this.value);
  mobilefilterObject.makeAvailabilityTrue();
  console.log(mobilefilterObject);
} else {
    mobilefilterObject.makeAvailabilityFalse();
}
DOMOBILEFILTERING();
});



$('#mobilepriceFilter').change(function() {
  console.log(this.value);
  mobilefilterObject.maxPrice = Number(this.value);
  console.log(mobilefilterObject);

  DOMOBILEFILTERING();
});


function mobileclearAll() {
  mobilefilterObject.clearAll();
}






function DOMOBILEFILTERING() {
  let filteredList = mobileItemList.filter(function(item) {
  // if price is correct
  if (mobilefilterObject.maxPrice >= item.values().mobileprice) {
    // NESTED
    // AVAILABILITY FALSE AND CONDITION FALSE
    if (mobilefilterObject.condition === false && mobilefilterObject.availability === false) {
      // NESTED
      // MAKES 0 + TYPES 0
      if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length === 0) {
        return true;
      // MAKES 1 + TYPES 0
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length === 0) {
        if (mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      // TYPES 1 + MAKES 0
      } else if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype)) {
          return true;
        }
      // MAKES 1 + TYPES 1
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype) && mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      }

    // NESTED
    // AVAILABILITY FALSE AND CONDITION TRUE
    } else if (mobilefilterObject.condition === true && mobilefilterObject.availability === false && item.values().mobilecondition === "New") {
      if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length === 0) {
        return true;
      // MAKES 1 + TYPES 0
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length === 0) {
        if (mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      // TYPES 1 + MAKES 0
      } else if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype)) {
          return true;
        }
      // MAKES 1 + TYPES 1
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype) && mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      }

    // NESTED
    // AVAILABILITY TRUE AND CONDITION TRUE
    } else if (mobilefilterObject.condition === true && mobilefilterObject.availability === true && item.values().condition === "New" && item.values().mobileavailability === "Active") {
      if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length === 0) {
        return true;
      // MAKES 1 + TYPES 0
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length === 0) {
        if (mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      // TYPES 1 + MAKES 0
      } else if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype)) {
          return true;
        }
      // MAKES 1 + TYPES 1
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype) && mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      }
    // NESTED
    // AVAILABILITY TRUE AND CONDITION FALSE
    } else if (mobilefilterObject.condition === false && mobilefilterObject.availability === true && item.values().mobileavailability === "Active") {
      if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length === 0) {
        return true;
      // MAKES 1 + TYPES 0
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length === 0) {
        if (mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      // TYPES 1 + MAKES 0
      } else if (mobilefilterObject.makes.length === 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype)) {
          return true;
        }
      // MAKES 1 + TYPES 1
      } else if (mobilefilterObject.makes.length > 0 && mobilefilterObject.types.length > 0) {
        if (mobilefilterObject.types.includes(item.values().mobiletype) && mobilefilterObject.makes.includes(item.values().mobilemake)) {
          return true;
        }
      }
    }
  } else {
    return false;
  }
});
  if (filteredList.length === 0) {
    document.getElementById('mobile-trailer-list-content').textContent = "No results found";
  }
}


$( "#mobileclearAllTrailerFilters" ).click(function() {
  mobileclearAll();
});


$(document).ready(function(){
  $("#mobile-makes-slideList").hide();
});

$( "#mobile-makes-slideToggle" ).click(function() {
  $( "#mobile-makes-slideList" ).slideToggle( "fast", function() {
  // Animation complete.
  });
});


$(document).ready(function(){
  $("#mobile-types-slideList").hide();
});

$( "#mobile-types-slideToggle" ).click(function() {
  $( "#mobile-types-slideList" ).slideToggle( "fast", function() {
// Animation complete.
  });
});


$(document).ready(function(){
  $("#mobile-toggle-trailer-filters").hide();
});
// testtest
$( "#mobile-filterToggleLink" ).click(function() {
  $( "#mobile-toggle-trailer-filters" ).slideToggle( "fast", function() {
//   console.log($("#filterToggleLink").content());
// console.log(document.getElementById('filterToggleLink').textContent);

  if (document.getElementById('mobile-filterToggleLink').textContent === "Show Filter") {
      document.getElementById('mobile-filterToggleLink').textContent = "Hide Filter";
  } else {
      document.getElementById('mobile-filterToggleLink').textContent = "Show Filter";
  }
  // Animation complete.
  });
});



