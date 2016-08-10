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

   })
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
   $routeProvider.when("/gallery", {
      templateUrl: "templates/gallery.html"
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
      controller: 'FavoriteBooksCtrl',
		templateUrl: 'templates/favoriteBooks.html'
	});
	$routeProvider.when('/favoriteArticles', {
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
   
   $scope.upload = function() {
      $scope.authObj = $firebaseAuth();
      $scope.currentUser = $scope.authObj.$getAuth();
      var file = document.getElementById("file-selector").files[0];
      r = new FileReader();
      console.log(file);
      r.onloadend = function(event) {
         var data = event.target.result;
      }
      r.readAsBinaryString(file);
      var storageRef = firebase.storage().ref("pdfs/" + file.name);
      var uploadTask = storageRef.put(file);
      uploadTask.on("state_changed", function(snapshot) {

      }, function(error) {

      }, function() {
         var downloadURL = uploadTask.snapshot.downloadURL;

         var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
         $scope.currentUserData = $firebaseObject(userRef);
         $scope.currentUserData.$loaded().then(function() {
            var pdfsRef = firebase.database().ref().child("pdfs").child($scope.currentUser.uid);
            $scope.pdfs = $firebaseArray(pdfsRef);
            $scope.pdfs.$loaded().then(function() {
               $scope.pdfs.$add({
                  admin_id: $scope.currentUser.uid,
                  pdf_name: $scope.pdfName,
                  pdf_description: $scope.pdfDescription,
                  pdf_image: downloadURL
               });

               console.log("PDF added to storage");
               $window.location.href = "#/main";
            });
         });
      });
   };

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
   var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
      $scope.currentUserData = $firebaseObject(userRef);
   var pdfsRef = firebase.database().ref().child("pdfs").child($scope.currentUser.uid);
      $scope.pdfs = $firebaseArray(pdfsRef);
});

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

/* -- For bookshelf funsies -- */
app.controller("FavoriteBooksCtrl", function($scope) {
   function toggleImage() {
   document.getElementById("lightbox").classList.add("isVisible");
   }
   function closeMenu() {
   document.getElementById("lightbox").classList.remove('isVisible');
   }
   document.getElementById("SteveJobs").onclick = function() {
   toggleImage();
   };
   document.getElementById('lightbox').onclick = function() {
   closeMenu();
   };
   document.getElementById("ElonMusk").onclick = function() {
   toggleImage();
   };
   document.getElementById('lightbox').onclick = function() {
   closeMenu();
   };
});


