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
      summary: "Based on more than forty interviews with Steve Jobs conducted over two years--as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues--Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection and ferocious drive revolutionized six industries: personal computers, animated movies, music, phones, tablet computing, and digital publishing. Isaacson's portrait touched millions of readers."
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
      summary: "What is the hallmark of exceptional CEO performance? In this refreshing, counterintuitive book, author Will Thorndike brings to bear the analytical wisdom of a successful career in investing, closely evaluating the performance of companies and their leaders. You will meet eight individualistic CEOs whose firms' average returns outperformed the S&P 500 by a factor of twenty-in other words, an investment of $10,000 with each of these CEOs, on average, would have been worth over $1.5 million twenty-five years later. "
    },
    {
      class: 'ColdSteel',
      title: 'Cold Steel: Lakshmi Mittal and the Multi-Billion-Dollar Battle for a Global Empire',
      author: 'Tim Bouquet',
      summary: "When the world's two largest steel producers went head to head in a bitter struggle for market domination, an epic corporate battle ensued that sent shockwaves through the political corridors of Europe, overheated the world's financial markets and transformed the steel industry. Billions of dollars were at stake. At the heart of the battle were two men: Guy Dolle, Chairman and CEO of Luxembourg-based Arcelor, the world's largest steel producer by turnover and Lakshmi Mittal, a self-made Indian industrialist and the richest man in Great Britain. Only one could prevail..."
    },
    {
      class: 'MrChina',
      title: 'Mr China',
      author: 'Tim Clissold',
      summary: "The incredible story of a Wall Street banker who went to China with $400,000,000 and learned the hard way how to do business there ...In the early nineties, China finally opened for business and Wall Street wanted in on the act. When the investment bankers arrived from New York with their Harvard MBAs, pinstripes and tasselled loafers, ready to negotiate with the Old Cadres, the stage was set for collision. This is the true story of a tough Wall Street banker who came to China looking for glory. He teamed up with an ex-Red Guard and a Mandarin-speaking Englishman. Together, they raised over $400,000,000 and bought up factories all over China. Only as they watched those millions slide towards the abyss did they start to understand that China really doesn't play by anyone else's rules."
    },
    {
      class: 'TheBlackSwan',
      title: 'The Black Swan',
      author: 'Nassim Nicholas Taleb',
      summary: "A black swan is an event, positive or negative, that is deemed improbable yet causes massive consequences. In this groundbreaking and prophetic book, Taleb shows in a playful way that Black Swan events explain almost everything about our world, and yet we-especially the experts-are blind to them."
    },
    {
      class: 'Innovators',
      title: 'The Innovators',
      author: 'Walter Isaacson',
      summary: "The Innovators is a masterly saga of collaborative genius destined to be the standard history of the digital revolution-and an indispensable guide to how innovation really happens. He explores the fascinating personalities that created our current digital revolution, such as Vannevar Bush, Alan Turing, John von Neumann, J.C.R. Licklider, Doug Engelbart, Robert Noyce, Bill Gates, Steve Wozniak, Steve Jobs, Tim Berners-Lee, and Larry Page. This is the story of how their minds worked and what made them so inventive. It's also a narrative of how their ability to collaborate and master the art of teamwork made them even more creative. For an era that seeks to foster innovation, creativity, and teamwork."
    },
    {
      class: 'Originals',
      title: 'Originals: How Non-Conformists Move the World',
      author: 'Adam Grant',
      summary: "In Originals Grant addresses the challenge of improving the world, but now from the perspective of becoming original: choosing to champion novel ideas and values that go against the grain, battle conformity, and buck outdated traditions. How can we originate new ideas, policies, and practices without risking it all? Using surprising studies and stories spanning business, politics, sports, and entertainment, Grant explores how to recognize a good idea, speak up without getting silenced, choose the right time to act, and manage fear and doubt; how parents and teachers can nurture originality in children. The payoff is a set of groundbreaking insights about rejecting conformity and improving the status quo."
    }, 
    {
      class: 'DeepValueInvesting',
      title: 'Deep Value Investing: Finding Bargain with Big Potential',
      author: 'Jeroen Bos',
      summary: "Deep Value Investing by Jeroen Bos is an incredibly candid and revealing guide to the secrets of deep value investment. Written by an investor with a long and remarkable track record, it shares for the first time the ins and outs of finding high-potential undervalued stocks before anyone else. Deep value investing means finding companies that are genuine bargains that can pay back phenomenally over the long term. They are firms so cheap that even if they were to close tomorrow their assets would pay you out at a profit. But if they can turn things around, the rewards will be many times greater... Let the market come to you."
    },
    {
      class: 'YourMoneyandYourBrain',
      title: 'Your Money and Your Brain: How the New Science of Neuroeconomics Can Help Make You Rich',
      author: 'Jason Zweig',
      summary: "Drawing on the latest scientific research, Jason Zweig shows what happens in your brain when you think about money and tells investors how to take practical, simple steps to avoid common mistakes and become more successful. What happens inside our brains when we think about money? Quite a lot, actually, and some of it isn't good for our financial health. Zweig, a veteran financial journalist, draws on the latest research in neuroeconomics, a fascinating new discipline that combines psychology, neuroscience, and economics to better understand financial decision making. Your Money and Your Brain offers some radical new insights into investing and shows investors how to take control of the battlefield between reason and emotion."
    },
    {
      class: 'WealthWarWisdom',
      title: 'Wealth, War and Wisdom',
      author: 'Barton Biggs',
      summary: "An intriguing look at how past market wisdom can help you survive and thrive during uncertain times. In Wealth, War & Wisdom, legendary Wall Street investor Barton Biggs reveals how the turning points of World War II intersected with market performance, and shows how these lessons can help the twenty-first-century investor comprehend our own perilous times as well as choose the best strategies for the modern market economy. Biggs skillfully discusses the performance of equities in both victorious and defeated countries, examines how individuals preserved their wealth despite the ongoing battles, and explores whether or not public equities were able to increase in value and serve as a wealth preserver. Biggs also looks at how other assets, including real estate and gold, fared during this dynamic and devastating period, and offers valuable insights on preserving one's wealth for future generations."
    },
    {
      class: 'EverythingIsObvious',
      title: 'Everything is Obvious: How Common Sense Fails Us',
      author: 'Duncan Watts',
      summary: "Drawing on the latest scientific research, along with a wealth of historical and contemporary examples, Watts shows how common sense reasoning and history conspire to mislead us into believing that we understand more about the world of human behavior than we do; and in turn, why attempts to predict, manage, or manipulate social and economic systems so often go awry. Only by understanding how and when common sense fails, Watts argues, can we improve how we plan for the future, as well as understand the present-an argument that has important implications in politics, business, and marketing, as well as in science and everyday life."
    },
    {
      class: 'OneUpOnWallStreet',
      title: 'One Up On Wall Street: How to Use What You Already Know to Make Money in the Market',
      author: 'Peter Lynch',
      summary: "Peter Lynch explains the advantages that average investors have over professionals and how they can use these advantages to achieve financial success. America’s most successful money manager tells how average investors can beat the pros by using what they know. According to Lynch, investment opportunities are everywhere. Lynch offers easy-to-follow advice for sorting out the long shots from the no-shots by reviewing a company’s financial statements and knowing which numbers really count. He offers guidelines for investing in cyclical, turnaround, and fast-growing companies. As long as you invest for the long term, Lynch says, your portfolio can reward you. "
    }, 
    {
      class: 'SimpleButNotEasy',
      title: 'Simple But Not Easy',
      author: 'Richard Oldfield',
      summary: "Simple But Not Easy has plenty of interest to the experienced professional, and is aimed also at the interested amateur investor. The theme of the book is that investment is simpler than non-professionals think it is in that the rudiments can be expressed in ordinary English, and picked up by anybody. It is not a science. But investment is also difficult. Richard Oldfield begins with a candid confession of some of his worst mistakes and what they have taught him. He discusses the different types of investment, why fees matter, and the importance of measuring performance properly. He also outlines what to look for, and what not to look for in an investment manager and when to fire a manager."
    },
    {
      class: 'JohnNeffonInvesting',
      title: 'John Neff on Investing',
      author: 'John Neff',
      summary: "In John Neff on Investing, Neff delineates, for the first time, the principles of his phenomenally successful low p/e approach to investing, and he describes the strategies, techniques, and investment decisions that earned him a place alongside Warren Buffett and Peter Lynch in the pantheon of modern investment wizards. Packed with solid advice and guidance for anyone who aspires to using Neff's unique brand of value investing, John Neff on Investing offers invaluable lessons on using price-earnings ratios as a yardstick, to zeroing in on undervalued stocks, interpreting earnings histories and anticipating new market climates. A narrative of Neff's early days-My Road to Windsor-reveals the extraordinary mindset and humble circumstances that shaped his winning investment philosophy. "
    }, 
    {
      class: 'ContrarianInvestment',
      title: 'Contrarian Investment Strategies: The Psychological Edge',
      author: 'David Dreman',
      summary: "One of the premier investment managers introduces vitally important new findings in psychology that show why most investment strategies are fatally flawed and his contrarian strategies are the best way to beat the market."
    },
    {
      class: 'ZebrainLionCountry',
      title: 'A Zebra in Lion Country',
      author: 'Ralph Wanger',
      summary: "Ralph Wanger explains the principles of investing in small, rapidly growing companies whose stocks represent good value. A Zebra in Lion Country offers an investment philosophy that will carry you through the rough spells and bring you greater wealth over the long term. Wanger displays his irreverent savvy in this guide to locating small company 'value' stocks that will yield well-above-average returns. Wanger shows every investor how to achieve the right balance of safety and risk, and imagination and discipline, to survive and prosper in the investment jungle. Destined to become a classic in the field of investing, A Zebra in Lion Country is as entertaining as it is instructive."
    }, 
    {
      class: 'FinancialFolly',
      title: 'This Time is Different: Eight Centuries of Financial Folly',
      author: 'Carmen Reinhart',
      summary: "Throughout history, rich and poor countries alike have been lending, borrowing, crashing--and recovering--their way through an extraordinary range of financial crises. Each time, the experts have chimed, 'this time is different'--claiming that the old rules of valuation no longer apply and that the new situation bears little similarity to past disasters. With this breakthrough study, leading economists Carmen Reinhart and Kenneth Rogoff definitively prove them wrong. Covering sixty-six countries across five continents, This Time Is Different presents a comprehensive look at the varieties of financial crises, and guides us through eight astonishing centuries of government defaults, banking panics, and inflationary spikes--from medieval currency debasements to today's subprime catastrophe."
    }, 
    {
      class: 'ValueInvesting',
      title: 'Value Investing: From Graham to Buffett and Beyond',
      author: 'Bruce Greenwald',
      summary: "From the 'guru to Wall Street's gurus' comes the fundamental techniques of value investing and their applications. Bruce Greenwald is one of the leading authorities on value investing. Some of the savviest people on Wall Street have taken his Columbia Business School executive education course on the subject. Now this dynamic and popular teacher, with some colleagues, reveals the fundamental principles of value investing, the one investment technique that has proven itself consistently over time. After covering general techniques of value investing, the book proceeds to illustrate their applications through profiles of Warren Buffett, Michael Price, Mario Gabellio, and other successful value investors. A number of case studies highlight the techniques in practice."
    },
    {
      class: 'ZerotoOne',
      title: 'Zero to One',
      author: 'Peter Thiel ',
      summary: "The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. In Zero to One, legendary entrepreneur and investor Peter Thiel shows how we can find singular ways to create those new things. Thiel begins with the contrarian premise that we live in an age of technological stagnation, even if we’re too distracted by shiny mobile devices to notice. Progress can be achieved in any industry or area of business. It comes from the most important skill that every leader must master: learning to think for yourself. Doing what someone else already knows how to do takes the world from 1 to n, adding more of something familiar. But when you do something new, you go from 0 to 1. Zero to One presents at once an optimistic view of the future of progress in America and a new way of thinking about innovation: it starts by learning to ask the questions that lead you to find value in unexpected places."
    }, 
    {
      class: 'GreatCrash1929',
      title: 'The Great Crash 1929',
      author: 'John Galbraith',
      summary: "Of John Kenneth Galbraith's The Great Crash 1929, the Atlantic Monthly said: 'Economic writings are seldom notable for their entertainment value, but this book is. Galbraith's prose has grace and wit, and he distills a good deal of sardonic fun from the whopping errors of the nation's oracles and the wondrous antics of the financial community.' Originally published in 1955, Galbraith's book became an instant bestseller, and in the years since its release it has become the unparalleled point of reference for readers looking to understand American financial history."
    }, 
    {
      class: 'IntelligentInvestor',
      title: 'The Intelligent Investor',
      author: 'Benjamin Graham',
      summary: "The greatest investment advisor of the twentieth century, Benjamin Graham, taught and inspired people worldwide. Graham's philosophy of 'value investing' -- which shields investors from substantial error and teaches them to develop long-term strategies -- has made The Intelligent Investor the stock market bible ever since its original publication in 1949. Over the years, market developments have proven the wisdom of Graham's strategies. Vital and indispensable, this HarperBusiness Essentials edition of The Intelligent Investor is the most important book you will ever read on how to reach your financial goals."
    }, 
    {
      class: 'MostImportantThing',
      title: 'The Most Important Thing Illuminated: Uncommon Sense for the Thoughtful Investor',
      author: 'Howard Marks',
      summary: ""
    }, 
    {
      class: 'HardThingaboutHardThings',
      title: 'The Hard Thing about Hard Things',
      author: 'Ben Horowitz',
      summary: ""
    }, 
    {
      class: 'TomorrowsGold',
      title: 'Tomorrow’s Gold: Asia’s Age of Discovery',
      author: 'Marc Faber',
      summary: ""
    }, 
    {
      class: 'FiveRules',
      title: 'The Five Rules for Successful Stock Investing',
      author: 'Pat Dorsey',
      summary: ""
    }, 
    {
      class: 'YouCanBe',
      title: 'You Can Be A Stock Market Genius',
      author: 'Joel Greenblatt',
      summary: ""
    }, 
    {
      class: 'ValueInvesting',
      title: 'Value Investing: Tools and Techniques for Intelligent Investment',
      author: 'James Montier',
      summary: ""
    }, 
    {
      class: 'MoreThanYouKnow',
      title: 'More Than You Know',
      author: 'Michael Mauboussin',
      summary: ""
    }, 
    {
      class: 'PanicOnWallStreet',
      title: 'Panic on Wall Street: A History of America’s Financial Disasters',
      author: 'Robert Sobel',
      summary: "The financial panics analyzed in this book illustrate the complexity of such events and that the causes are varied: political, military, economic, and even psychological."
    }, 
    {
      class: 'InvestingtheTempletonWay',
      title: 'Investing the Templeton Way',
      author: 'Lauren Templeton',
      summary: ""
    }, 
    {
      class: 'ValueInvestors',
      title: 'The Value Investors',
      author: 'Ronald Chan',
      summary: "In an attempt to understand exactly what kind of temperament, Ronald W. Chan interviewed 12 value-investing legends from around the world, learning how their personal background, culture, and life experiences have shaped their investment mindset and strategy. The Value Investors: Lessons from the World’s Top Fund Managers is the result."
    },
    {
      class: 'TheBigShort',
      title: 'The Big Short: Inside the Doomsday Machine',
      author: 'Michael Lewis',
      summary: ""
    }, 
    {
      class: 'CompetitionDemystified',
      title: 'Competition Demystified',
      author: 'Bruce Greenwald',
      summary: "Greenwald and his coauthor, Judd Kahn, offer an easy-to-follow method for understanding the competitive structure of your industry and developing an appropriate strategy for your specific position. Over the last two decades, the conventional approach to strategy has become frustratingly complex. It’s easy to get lost in a sophisticated model of your competitors, suppliers, buyers, substitutes, and other players, while losing sight of the big question: Are there barriers to entry that allow you to do things that other firms cannot?"
    }, 
    {
      class: 'CommonStocksAnd',
      title: 'Common Stocks and Uncommon Profits and Other Writings',
      author: 'Philip Fisher',
      summary: "This book is invaluable reading and has been since it was first published in 1958. The updated paperback retains the investment wisdom of the original edition and includes the perspectives of the author's son Ken Fisher, an investment guru in his own right in an expanded preface and introduction. 'I sought out Phil Fisher after reading his Common Stocks and Uncommon Profits...A thorough understanding of the business, obtained by using Phil's techniques...enables one to make intelligent investment commitments.' - Warren Buffet"
    }, 
    {
      class: 'PoorCharliesAlmanack',
      title: 'Poor Charlie’s Almanack: The Wit and Wisdom of Charles T. Munger',
      author: 'Charles T. Munger and Peter Kaufman',
      summary: "Poor Charlie's Almanack contains the wit and wisdom of Charlie Munger: his talks, lectures and public commentary. And, it has been written and compiled with both Charlie Munger and Warren Buffett's encouragement and cooperation. Charlie's unique worldview, what he calls a 'multidisciplinary' approach, is a self-developed model for clear and simple thinking while being far from simplistic itself. Throughout the book, Charlie displays his intellect, wit, integrity, and rhetorical flair. Using his encyclopedic knowledge, he cites references from classical orators to eighteenth- and nineteenth-century European literati to pop culture icons of the moment while simultaneously reinforcing the virtues of lifelong learning and intellectual curiosity."
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



