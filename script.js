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
      controller: "SignupCtrl"
   })

	$routeProvider.when("/login", {
	   templateUrl: "templates/login.html",
		controller: "LoginCtrl"
	});
    $routeProvider.when("/adminlogin", {
      templateUrl: "templates/adminlogin.html",
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
      // controller: "GalleryCtrl"
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
app.directive("fileread", function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }
});
app.controller("AdminCtrl", function($scope, $firebaseAuth, $routeParams, $firebaseObject, $firebaseArray, $window) {
  //  $scope.upload = function() {
  //     var imgRef = firebase.storage().ref().child($scope.newMessage.image.name);
  //     var uploadTask = imgRef.put($scope.newMessage.image)// Listen for state changes, errors, and completion of the upload.
  //     uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  //     function(snapshot) {
  //        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
  //        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //        console.log('Upload is ' + progress + '% done');
  //     }, function(error) {
  //        console.log(error);
  //     }, function() {
  //        // Upload completed successfully, now we can get the download URL
  //        var downloadURL = uploadTask.snapshot.downloadURL;
  //        console.log("Download", downloadURL, $scope.newMessage);
  //     $scope.messages.$add({
  //       sender: currentAuth.uid,
  //       text: $scope.newMessage.text,
  //       image: downloadURL,
  //       created_at: Date.now()
  //     });
  //   });
  // };
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
      var storageRef = firebase.storage().ref("pdfs/" + $scope.currentUser.uid + "/" + file.name);
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

               console.log("PDF added");
               $window.location.href = "#/main";
            });
         });
      });
   };

});

/* -- Directive and Controller for main.html (for clients)-- */
app.directive('fileDownload',function(){
    return{
        restrict:'A',
        scope:{
            fileDownload:'=',
            fileName:'=',
        },

        link:function(scope,elem,atrs){

            scope.$watch('fileDownload',function(newValue, oldValue){

                if(newValue!=undefined && newValue!=null){
                    console.debug('Downloading a new file'); 
                    var isFirefox = typeof InstallTrigger !== 'undefined';
                    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                    var isIE = /*@cc_on!@*/false || !!document.documentMode;
                    var isEdge = !isIE && !!window.StyleMedia;
                    var isChrome = !!window.chrome && !!window.chrome.webstore;
                    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
                    var isBlink = (isChrome || isOpera) && !!window.CSS;

                    if(isFirefox || isIE || isChrome){
                        if(isChrome){
                            console.log('Manage Google Chrome download');
                            var url = window.URL || window.webkitURL;
                            var fileURL = url.createObjectURL(scope.fileDownload);
                            var downloadLink = angular.element('<a></a>');//create a new  <a> tag element
                            downloadLink.attr('href',fileURL);
                            downloadLink.attr('download',scope.fileName);
                            downloadLink.attr('target','_self');
                            downloadLink[0].click();//call click function
                            url.revokeObjectURL(fileURL);//revoke the object from URL
                        }
                        if(isIE){
                            console.log('Manage IE download>10');
                            window.navigator.msSaveOrOpenBlob(scope.fileDownload,scope.fileName); 
                        }
                        if(isFirefox){
                            console.log('Manage Mozilla Firefox download');
                            var url = window.URL || window.webkitURL;
                            var fileURL = url.createObjectURL(scope.fileDownload);
                            var a=elem[0];//recover the <a> tag from directive
                            a.href=fileURL;
                            a.download=scope.fileName;
                            a.target='_self';
                            a.click();//we call click function
                        }


                    }else{
                        alert('SORRY YOUR BROWSER IS NOT COMPATIBLE');
                    }
                }
            });

        }
    }
})

app.controller('MainCtrl', function($scope, $firebaseAuth, $location) {
    var auth = $firebaseAuth();
    $scope.logout = function() {
    	auth.$signOut();
      console.log("User signed out");
    	$location.path("/");
  	};
	
	$scope.myBlobObject=undefined;
	$scope.getFile=function(){
        console.log('download started, you can show a wating animation');
        serviceAsPromise.getStream({param1:'data1',param1:'data2'})
        .then(function(data){//is important that the data was returned as Aray Buffer
                console.log('Stream download complete, stop animation!');
                $scope.myBlobObject=new Blob([data],{ type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        },function(fail){
                console.log('Download Error, stop animation and show error message');
                                    $scope.myBlobObject=[];
                                });
   };
   $scope.downloadFile = function() {
      $scope.authObj = $firebaseAuth();
      $scope.currentUser = $scope.authObj.$getAuth();

      // Create a reference from a Google Cloud Storage URI
      var gsReference = storage.refFromURL('gs://pendulumadvisors-f7655.appspot.com/pdfs/' + file.name);
      // Get the download URL
      gsReference.getDownloadURL().then(function(url) {
      // Insert url into an <img> tag to "download"
      }).catch(function(error) {
      switch (error.code) {
         case 'storage/object_not_found':
         // File doesn't exist
         break;

         case 'storage/unauthorized':
         // User doesn't have permission to access the object
         break;

         case 'storage/canceled':
         // User canceled the upload
         break;

         case 'storage/unknown':
         // Unknown error occurred, inspect the server response
         break;
      }
   });                  
   };
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

/*-- Gallery Controller --*/
// app.controller("GalleryCtrl", function($scope) {
  
// });

