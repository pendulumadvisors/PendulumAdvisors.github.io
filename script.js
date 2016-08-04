var app = angular.module("pendulumApp", ["ngRoute", "firebase"]); 

// app.run(["$rootScope", "$location", function($rootScope, $location) {
//   $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
//     // We can catch the error thrown when the $requireSignIn promise is rejected
//     // and redirect the user back to the home page
//     if (error === "AUTH_REQUIRED") {
//       $location.path("/");
//     }
//   });
// }]);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when("/", {
		templateUrl: "templates/home.html",
		controller: 'ScrollCtrl'
    });
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
        controller: "AdminCtrl"
    });
	$routeProvider.when('/main', {
		templateUrl: 'templates/main.html',
		controller: 'MainCtrl'
		// resolve: {
  //     		"currentAuth": function($firebaseAuth) {
	 //        return $firebaseAuth().$requireSignIn();
  //     		}
  // 		}	
	});
    $routeProvider.when("/research", {
        templateUrl: "templates/research.html"
    });
	$routeProvider.when('/InternalResearch', {
		templateUrl: 'templates/InternalResearch.html'
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
app.controller('LoginCtrl', function($scope, $firebaseAuth, $location) {
    $scope.authObj = $firebaseAuth();

	$scope.login = function() {
		console.log("do login");
		$scope.errorMessage = "";
		console.log($scope.password);
		
		var ref = new Firebase("https://pendulumadvisors-f7655.firebaseio.com");
		ref.authWithPassword({
			"password": "123456"
		}, function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			} else {
				console.log("Authentication success!", authData);
			}
		});
		// $scope.authObj.$signInWithEmailAndPassword($scope.email, $scope.password)
		// .then(function(firebaseUser) {
		// 	console.log("Signed in as:", firebaseUser.uid);
		// 	$scope.firebaseUser1 = firebaseUser;
		// 	console.log($scope.firebaseUser1);
		// }).catch(function(error) {
		// 	console.error("Authentication failed:", error);
		// 	$scope.errorMessage = error.message;
		// });
	
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
app.controller("AdminCtrl", function(currentAuth, $scope, $routeParams, $firebaseObject, $firebaseArray) {
   $scope.upload = function() {
      var imgRef = firebase.storage().ref().child($scope.newMessage.image.name);
      var uploadTask = imgRef.put($scope.newMessage.image)// Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
         // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
         var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
         console.log('Upload is ' + progress + '% done');
      }, function(error) {
         console.log(error);
      }, function() {
         // Upload completed successfully, now we can get the download URL
         var downloadURL = uploadTask.snapshot.downloadURL;
         console.log("Download", downloadURL, $scope.newMessage);
      $scope.messages.$add({
        sender: currentAuth.uid,
        text: $scope.newMessage.text,
        image: downloadURL,
        created_at: Date.now()
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
    	$location.path("/");
  	};
	// $scope.download = function() {
	// 	final long ONE_MEGABYTE = 1024 * 1024;
	// 	islandRef.getBytes(ONE_MEGABYTE).addOnSuccessListener(new OnSuccessListener<byte[]>() {
 //   			@Override
 //    		public void onSuccess(byte[] bytes) {
 //        		// Data for "images/island.jpg" is returns, use this as needed
 //    		}
	// 	}).addOnFailureListener(new OnFailureListener() {
 //    		@Override
 //    		public void onFailure(@NonNull Exception exception) {
 //        		// Handle any errors
 //    		}
	// 	});
	// };
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
});

