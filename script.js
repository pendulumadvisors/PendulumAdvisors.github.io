var app = angular.module("pendulumApp", ["ngRoute", "firebase"]); 

app.run(["$rootScope", "$location", function($rootScope, $location) {
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/login");
    }
  });
}]);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when("/", {
		templateUrl: "templates/home.html",
		controller: 'ScrollCtrl'
   });
   $routeProvider.when("/signup", {
      templateUrl: "templates/signup.html",
      controller: "SignupCtrl",
      resolve: {
            "currentAuth": function($firebaseAuth) {
            return $firebaseAuth().$requireSignIn();
            }
      }
   });
	$routeProvider.when("/login", {
	   templateUrl: "templates/login.html",
		controller: "LoginCtrl"
	});
  $routeProvider.when("/adminPage", {
      templateUrl: "templates/adminPage.html",
      controller: "AdminCtrl",
      resolve: {
          "currentAuth": function($firebaseAuth) {
          return $firebaseAuth().$requireSignIn();
          }
      }
  });
	$routeProvider.when('/main', {
		  templateUrl: 'templates/main.html',
		  controller: 'MainCtrl',
		  resolve: {
      	  "currentAuth": function($firebaseAuth) {
	        return $firebaseAuth().$requireSignIn();
      		}
  		}	
	});
  $routeProvider.when("/carandtulips", {
    templateUrl: "templates/carandtulips.html"
  });
  $routeProvider.when("/gallery", {
    templateUrl: "templates/gallery.html"
  });
  $routeProvider.when("/disclaimer", {
    templateUrl: "templates/disclaimer.html"
  });
  $routeProvider.when("/research", {
    templateUrl: "templates/research.html"
  });
	$routeProvider.when('/ExternalResearch', {
		templateUrl: 'templates/ExternalResearch.html'
	});
	$routeProvider.when('/podcasts', {
		templateUrl: 'templates/podcasts.html' 
	});
	$routeProvider.when('/favoriteBooks', {
    controller: 'favoriteBooksCtrl',
		templateUrl: 'templates/favoriteBooks.html'
	});
	$routeProvider.when('/favoriteArticles', {
    controller: 'ArticlesCtrl',
		templateUrl: 'templates/favoriteArticles.html'
	});
});


/*-- Service and Controller for anchorSmoothScroll --*/
app.service('anchorSmoothScroll', function(){
    this.scrollTo = function(eID) {

        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }
    };
});

app.controller('ScrollCtrl', function($scope, $location, anchorSmoothScroll) {
   
    $scope.gotoElement = function (eID){
      // set the location.hash to the id of
      // the element you wish to scroll to.
      console.log("scroll success!");
      $location.hash('bottom');
 
      // call $anchorScroll()
      anchorSmoothScroll.scrollTo(eID);
    };
  });


/*-- Controller for Login --*/
app.controller('LoginCtrl', function($scope, $firebaseObject, $firebaseAuth, $firebaseArray, $window) {
    $scope.authObj = $firebaseAuth();
    
    $scope.logIn = function() {
      $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
      .then(function(firebaseUser) {
      console.log("Signed in as:", firebaseUser.uid);
      $window.location.href = "#/main";

         // $scope.currentUser = $scope.authObj.$getAuth();
         // var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
         // $scope.user = $firebaseObject(userRef);
      }).catch(function(error) {
      console.error("Authentication failed:", error);
      });
   }
});


/* -- Controller for adminPage.html -- */
app.controller("AdminCtrl", function($scope, $firebaseAuth, $routeParams, $firebaseObject, $firebaseArray, $window) {
   
   $scope.uploadInternal = function() {
      $scope.authObj = $firebaseAuth();
      $scope.currentUser = $scope.authObj.$getAuth();
      var file = document.getElementById("file-selector").files[0];
      r = new FileReader();
      console.log(file);
      r.onloadend = function(event) {
         var data = event.target.result;
      }
      r.readAsBinaryString(file);
      var storageRef = firebase.storage().ref("pdfsInternalResearch/" + file.name);
      var uploadTask = storageRef.put(file);
      uploadTask.on("state_changed", function(snapshot) {

      }, function(error) {

      }, function() {
         var downloadURL = uploadTask.snapshot.downloadURL;

         var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
         $scope.currentUserData = $firebaseObject(userRef);
         $scope.currentUserData.$loaded().then(function() {
            var pdfsInternalResearchRef = firebase.database().ref().child("pdfsInternalResearch");
            $scope.pdfsInternalResearch = $firebaseArray(pdfsInternalResearchRef);
            $scope.pdfsInternalResearch.$loaded().then(function() {
               $scope.pdfsInternalResearch.$add({
                  admin_id: $scope.currentUser.uid,
                  pdf_name: $scope.pdfInternalResearchName,
                  pdf_description: $scope.pdfInternalResearchDescription,
                  pdf_image: downloadURL
               });

               console.log("PDF added to storage");
               $window.location.href = "#/main";
            });
         });
      });
   };

   $scope.uploadArticles = function() {
      $scope.authObj = $firebaseAuth();
      $scope.currentUser = $scope.authObj.$getAuth();

      var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
      $scope.currentUserData = $firebaseObject(userRef);
      $scope.currentUserData.$loaded().then(function() {
         var articlesRef = firebase.database().ref().child("favouriteArticles");
         $scope.articles = $firebaseArray(articlesRef);
         $scope.articles.$loaded().then(function() {
            $scope.articles.$add({
               admin_id: $scope.currentUser.uid,
               article_name: $scope.articleName,
               article_description: $scope.articleDescription,
               article_url: $scope.article_url
            });

            console.log("Article added to database");
            $window.location.href = "#/favoriteArticles";
         });
      });
   };

   // $scope.uploadExternal = function() {
   //    $scope.authObj = $firebaseAuth();
   //    $scope.currentUser = $scope.authObj.$getAuth();
   //    var file = document.getElementById("file-selector").files[0];
   //    e = new FileReader();
   //    console.log(file);
   //    e.onloadend = function(event) {
   //       var data = event.target.result;
   //    }
   //    e.readAsBinaryString(file);
   //    var storageRef = firebase.storage().ref("pdfsExternalResearch/" + file.name);
   //    var uploadTask = storageRef.put(file);
   //    uploadTask.on("state_changed", function(snapshot) {

   //    }, function(error) {

   //    }, function() {
   //       var downloadURL = uploadTask.snapshot.downloadURL;

   //       var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
   //       $scope.currentUserData = $firebaseObject(userRef);
   //       $scope.currentUserData.$loaded().then(function() {
   //          var pdfsExternalResearchRef = firebase.database().ref().child("pdfsExternalResearch");
   //          $scope.pdfsExternalResearch = $firebaseArray(pdfsExternalResearchRef);
   //          $scope.pdfsExternalResearch.$loaded().then(function() {
   //             $scope.pdfsExternalResearch.$add({
   //                admin_id: $scope.currentUser.uid,
   //                pdf_name: $scope.pdfExternalResearchName,
   //                pdf_description: $scope.pdfExternalResearchDescription,
   //                pdf_image: downloadURL
   //             });

   //             console.log("PDF added to storage");
   //             $window.location.href = "#/ExternalResearch";
   //          });
   //       });
   //    });
   // };
   
   // $scope.uploadPodcasts = function() {
   //    $scope.authObj = $firebaseAuth();
   //    $scope.currentUser = $scope.authObj.$getAuth();

   //    var downloadURL = uploadTask.snapshot.downloadURL;

   //    var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
   //    $scope.currentUserData = $firebaseObject(userRef);
   //    $scope.currentUserData.$loaded().then(function() {
   //       var pdfsRef = firebase.database().ref().child("Podcasts");
   //       $scope.pdfs = $firebaseArray(pdfsRef);
   //       $scope.pdfs.$loaded().then(function() {
   //          $scope.pdfs.$add({
   //             admin_id: $scope.currentUser.uid,
   //             pdf_name: $scope.pdfName,
   //             pdf_description: $scope.pdfDescription,
   //             pdf_image: downloadURL
   //          });

   //          console.log("PDF added to storage");
   //          $window.location.href = "#/ExternalResearch";
   //       });
   //    });
   // };
});


/* -- Controller for main.html (for clients)-- */
app.controller('MainCtrl', function($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $location) {
    var auth = $firebaseAuth();
    $scope.logout = function() {
    	auth.$signOut();
      console.log("User signed out");
    	$location.path("/");
  	};

   $scope.authObj = $firebaseAuth();
   $scope.currentUser = $scope.authObj.$getAuth();
   // var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
   //    $scope.currentUserData = $firebaseObject(userRef);
   var pdfsInternalResearchRef = firebase.database().ref().child("pdfsInternalResearch");
      $scope.pdfsInternalResearch = $firebaseArray(pdfsInternalResearchRef);
});


/* -- Controller for Favorite Books page -- */
app.controller('favoriteBooksCtrl', function($scope, $location) {
   $scope.books = [
    {
      class: 'SteveJobs',
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      summary: 'Based on more than forty interviews with Steve Jobs conducted over two years—as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries: personal computers, animated movies, music, phones, tablet computing, and digital publishing. Isaacson’s portrait touched millions of readers.'
    },
    {
      class:'ElonMusk',
      title: 'Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future',
      author: 'Ashlee Vance',
      summary: "In Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future, veteran technology journalist Ashlee Vance provides the first inside look into the extraordinary life and times of Silicon Valley's most audacious entrepreneur. Written with exclusive access to Musk, his family and friends, the book traces the entrepreneur's journey from a rough upbringing in South Africa to the pinnacle of the global business world. Vance spent more than 30 hours in conversation with Musk and interviewed close to 300 people to tell the tumultuous stories of Musk's world-changing companies: PayPal, Tesla Motors, SpaceX and SolarCity, and to characterize a man who has renewed American industry and sparked new levels of innovation while making plenty of enemies along the way."
    },
    {
      class: 'DethroningTheKing',
      title: 'Dethroning The King: The Hostile Takeover of Anheuser-Busch',
      author: 'Julie MacIntosh',
      summary: "In Dethroning the King, Julie MacIntosh, the award-winning financial journalist who led coverage of the takeover for the Financial Times, details how the drama that unfolded at Anheuser-Busch in 2008 went largely unreported as the world tumbled into a global economic crisis second only to the Great Depression. Today, as the dust settles, questions are being asked about how the 'King of Beers' was so easily captured by a foreign corporation, and whether the company's fall mirrors America's dwindling financial and political dominance as a nation."
    },
    {
      class: 'TheOutsiders',
      title: 'The Outsiders: Eight Unconventional CEOs and Their Radically Rational Blueprint for Success',
      author: 'William Thorndike',
      summary: "What is the hallmark of exceptional CEO performance? In this refreshing, counterintuitive book, author Will Thorndike brings to bear the analytical wisdom of a successful career in investing, closely evaluating the performance of companies and their leaders. You will meet eight individualistic CEOs whose firms’ average returns outperformed the S&P 500 by a factor of twenty—in other words, an investment of $10,000 with each of these CEOs, on average, would have been worth over $1.5 million twenty-five years later. "
    },
    {
      class: 'ColdSteel',
      title: 'Cold Steel: Lakshmi Mittal and the Multi-Billion-Dollar Battle for a Global Empire',
      author: 'Tim Bouquet',
      summary: "When the world's two largest steel producers went head to head in a bitter struggle for market domination, an epic corporate battle ensued that sent shockwaves through the political corridors of Europe, overheated the world's financial markets and transformed the steel industry. Billions of dollars were at stake. At the heart of the battle were two men: Guy Dollé, Chairman and CEO of Luxembourg-based Arcelor, the world's largest steel producer by turnover and Lakshmi Mittal, a self-made Indian industrialist and the richest man in Great Britain. Only one could prevail… "
    }
  ]
  $scope.bookHovered = function(book) {
    $scope.hoveredBook = book;
  }
  $scope.bookNotHovered = function(book) {
    $scope.hoveredBook = null;
  }

});


/* -- Controller for Articles page -- */
app.controller('ArticlesCtrl', function($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $location) {

   var articlesRef = firebase.database().ref().child("favouriteArticles");
      $scope.articles = $firebaseArray(articlesRef);

});


/* -- -- */
app.controller("SignupCtrl", function($scope, $firebaseAuth, $firebaseObject, $firebaseArray, $window) {
   $scope.authObj = $firebaseAuth();

   $scope.signUp = function() {

      $scope.authObj.$createUserWithEmailAndPassword($scope.newEmail, $scope.newPassword).then(function(firebaseUser) {
         var ref = firebase.database().ref().child("users").child(firebaseUser.uid);
         $scope.user = $firebaseObject(ref);
         $scope.user.username = $scope.newUsername;
         $scope.user.first_name = $scope.newFirstName;
         $scope.user.last_name = $scope.newLastName;
         $scope.user.email = $scope.newEmail;
         $scope.user.password = $scope.newPassword;
         $scope.user.$save();
         console.log("User " + firebaseUser.uid + " successfully created!");

         $scope.newUsername = "";
         $scope.newFirstName = "";
         $scope.newLastName = "";
         $scope.newEmail = "";
         $scope.newPassword = "";

         $window.location.href = "#/main";
      }).catch(function(error) {
         console.log("Error: ", error);
      })
   };
});



