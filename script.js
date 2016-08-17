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

         // var userRef = firebase.database().ref().child("users").child($scope.currentUser.uid);
         // $scope.currentUserData = $firebaseObject(userRef);
         // $scope.currentUserData.$loaded().then(function() {
            var pdfsInternalResearchRef = firebase.database().ref().child("pdfsInternalResearch");
            $scope.pdfsInternalResearch = $firebaseArray(pdfsInternalResearchRef);
            $scope.pdfsInternalResearch.$loaded().then(function() {
               $scope.pdfsInternalResearch.$add({
                  admin_id: $scope.currentUser.uid,
                  pdf_name: $scope.pdfInternalResearchName,
                  pdf_description: $scope.pdfInternalResearchDescription,
                  pdf_link: downloadURL
               });

               console.log("PDF added to storage");
               $window.location.href = "#/main";
            });
         // });
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
      summary: "Based on more than 40 interviews with Steve Jobs conducted over a 2 year period, as well as interviews with more than a hundred family members, friends, adversaries, competitors and colleagues.  Steve Jobs cooperated with this book but had no control over what was written, which gives the book an extremely frank insight into a remarkable man who shaped his approach to business and the innovative products that resulted from his remarkable imagination and drive.",
      quote: 'Memorable quote: "Steve, I don\'t give a shit about Apple", Andy Grove\'s reply to Steve Jobs when asked on an early Saturday morning if taking on the role of temporary CEO at Apple, while being CEO at Pixar, would be a good idea.'
    },
    {
      class:'ElonMusk',
      title: 'Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future',
      author: 'Ashlee Vance',
      summary: "South African-born Elon Musk is the man behind Zip2, which was sold to Compaq Computers in 1998 for U$307m, enabling Musk to start X.com, which merged with Peter Thiel's Confinity (parent company of PayPal) in March 2000. PayPal was sold to eBay in July 2002 for U$1.5bn, enabling Musk to conceptualize 'Mars Oasis', a project to land an experimental greenhouse on Mars to grow crops. This project resulted in SpaceX, the lowest-cost provider of commercial space travel. In 2004, Musk also lead the A series investment in Tesla Motors, where he took over as CEO in 2008, following the global financial crisis.",
      quote: 'Memorable quote: "Do you think I am insane?" Musk asking Ashlee Vance during their first meeting to discuss the book.'
    },
    {
      class: 'DethroningTheKing',
      title: 'Dethroning The King: The Hostile Takeover of Anheuser-Busch',
      author: 'Julie MacIntosh',
      summary: "In the summer of 2008, the US-based, Busch family-controlled, beer brewing business, became the 'victim' of a hostile takeover bid by InBev, itself a product of a merger between Belgium's Interbrew and Brazil's Ambev.  The book details the trials and tribulations of how an emerging market brewer went from a dominant position in one market in 1999 to leading the world's beer market over the course of 9 years, with the cherry on top being the acquisition of Anheuser-Busch. The book details how the Busch clan lost control of an iconic beer company that was a market leader by volume and value in the largest beer market in the world.",
      quote: 'Memorable quote: "My concern is that across America, this is happening. Maybe it\'s not all bad - I\'m a big believer in globalization and a world economy and things that could lead to peace long term. But I do worry when so many U.S. companies are going into foreign ownership".  General Hugh Shelton, retired Chairman of Joints Chiefs of Staff and Anheuser-Busch director.'
    },
    {
      class: 'TheOutsiders',
      title: 'The Outsiders: Eight Unconventional CEOs and Their Radically Rational Blueprint for Success',
      author: 'William Thorndike',
      summary: "Almost all books that deal with CEOs or management books focus on how to manage. More importantly and 'easier' to measure, this book describes the most crucial of tasks to judge the quality of a CEO by: capital allocation through 8 different examples of how each of the choices that CEOs have can work. Essentially, CEOs have 5 choices for deploying capital: \nInvest in existing operations;\nAcquiring new operations;\nIssuing dividends;\nPaying down debt; and \nBuying back shares.",
      quote: 'Memorable quote: "Henry Singleton has the best operational and capital deployment record in American business...if one took the top 100 top business school graduates and made a composite of their triumphs, their record would not be as good as Singleton\'s" - Warren Buffett on Henry Singleton\'s success at Teledyne.'
    },
    {
      class: 'ColdSteel',
      title: 'Cold Steel: Lakshmi Mittal and the Multi-Billion-Dollar Battle for a Global Empire',
      author: 'Tim Bouquet',
      summary: 'In some ways, the book is similar to "Dethroning the King": emerging markets acquire developed market stalwarts in hostile way. However, the book is different as the authors were very closely involved, directly and indirectly, in the take-over by Mittal of the world\'s largest steel producer by revenues: Arcelor. What does transpire, though, is that not all management decisions are rational and management teams are not always, consciously or unconsciously, aware of their fiduciary duties towards all shareholders, sometimes favouring one over another.',
      quote: 'Memorable quote: "You know what, I was dead against that Indian guy," the cabbie said. \"It\'s our company - no way is an Indian guy going to take our company. But you know what, now I\'d rather go for a clear deal with an Indian than to do a murky deal with a Russian\". So dramatic was this battle for Luxembourgers that everybody in the country, from the super-market shelf-stackers to the secretaries in the Prime Minister\'s office, had a view.'
    },
    {
      class: 'MrChina',
      title: 'Mr China',
      author: 'Tim Clissold',
      summary: 'When China opened up for foreign capital in the early 1990\'s, America\'s investment bankers wanted a slice of the action. The book deals with the clash of cultures between American bankers, focused on short-term profits, while the Chinese took a different view. Then, and perhaps still applicable today, China was seen as Asia\'s wild west. Blinded by the promise of access to over 1 billion new consumers, the writer and 2 partners raise a U$400m private equity fund to cash in.',
      quote: 'Memorable quote: "Madam Wu," I said, \"it cannot get worse. It is not possible. We are already at rock bottom. We are sending out flat beer that tastes like rotten vinegar packaged in beer bottles with filthy old labels that say \"Soy Sauce\".  There hasn\'t been \"a whole mass of confusion\" like this since the collapse of the Qing Dynasty. At least that was presided over by an Empress Dowager with six-inch finger-nails who was carried around in a yellow sedan chair!\"'
    },
    {
      class: 'TheBlackSwan',
      title: 'The Black Swan',
      author: 'Nassim Nicholas Taleb',
      summary: 'Taleb\'s follow up from Fooled by Randomness, this book continues along the same lines - random events to which we describe a low possibility and no probability happen more often than not, and while after the event, humans are extremely capable of explaining why these events happen, almost no one has an ability to predict. The book is highly insightful and entertaining and actually has more to do with everyday life than with business.',
      quote: 'Memorable quote: "The problem with experts is that they do not know what they do not know".'
    },
    {
      class: 'Innovators',
      title: 'The Innovators',
      author: 'Walter Isaacson',
      summary: 'This book deals with the creation of the computer and the Internet by groups of people - not individuals. Contrary to what we may believe now, most inventions were made by individuals working together on each others\' ideas. The book describes how and why people collaborated and why their ability to work as teams made them even more creative.',
      quote: 'Memorable quote: "Progress comes not only in great leaps but also from hundreds of small steps".'
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
      summary: 'There are not that many books about deep value investing but Jeroen Bos\' book is worth reading due to its simplicity. Comprehensive but to the point, he uses mainly examples from his own experience, including his mistakes - something that not many investment books deal with. While most books focus on the supposed relationship between risk and return, Bos focuses primarily on return through the elimination of risk by focusing on the margin of safety on the balance sheet.',
      quote: 'Memorable quote: "The lesson to be learned from this is that high debt levels have to be treated with great caution even if these seems to be a reasonable margin of safety".'
    },
    {
      class: 'YourMoneyandYourBrain',
      title: 'Your Money and Your Brain: How the New Science of Neuroeconomics Can Help Make You Rich',
      author: 'Jason Zweig',
      summary: 'What happens to our brain when we think about money? Quite a lot and not all that we think about when we think about money will be necessarily good for our financial health. The book describes in some detail the issues that many investors have to deal with - our brain. Through a combination of psychology, neuroscience and economics, Zweig explains the different emotions of greed, confidence, fear, surprise, regret and happiness and how these may impact financial decision making.',
      quote: 'Memorable quote: "Neither a man nor a crowd nor a nation can be trusted to act humanely or think sanely under the influence of a great fear... To conquer fear it the beginning of wisdom". - Bertrand Russell'
    },
    {
      class: 'WealthWarWisdom',
      title: 'Wealth, War and Wisdom',
      author: 'Barton Biggs',
      summary: 'This book, published in 2008, as Barton Biggs\' follow up form Hedgehogging, which dealt with the former Morgan Stanley partner having left to start a new hedge fund, Traxis Partners.\n\
      In this book, the late Biggs deals with how financial markets behaved during wars, and contrary to common believe, the wisdom of crowds actually prevailed.  For instance, the British stock market bottomed out just before the Battle of Britain, the German stock market peaking at the end of 1941, just before it became clear that Germany could and would not be successful in Russia.\n\
      The book makes it clear that in times of war, asset diversity as well as geographical asset diversity is crucial. True to this day, following the Asian crisis of 1998 and the Russian crisis of 2000, and many blow-outs with emerging market currencies, anyone who has created or inherited big money always should keep an escape hatch open and maintain some substantial wealth outside the country of residence. The book gives many examples of what was done in the past by the wealthy and this panned out (not always positive).',
      quote: 'Memorable quote: "What is the message for owners of wealth who have lived in a country for generations but are a minority - particularly a prosperous minority? The German Jews call it shtetl, literally the ghetto mentality of always looking over your shoulder".'
    },
    {
      class: 'EverythingIsObvious',
      title: 'Everything is Obvious: How Common Sense Fails Us',
      author: 'Duncan Watts',
      summary: 'This book explains in great detail and with a good sense of humour why common sense so often fails - not just in financial markets but in life in general. Using a host of historical and contemporary examples, the author shows how common sense reasoning and history conspire in misleading us to believe that we understand more about the world of human behaviour than we do. Also, as a result of this behaviour, why our attempts to predict, manage or manipulate social and economic systems often go awry.',
      quote: 'Memorable quote: "Surprisingly, the company that \'got it right\' in the music industry was Apple, with their combination of the iPod player and their iTunes store. In retrospect, Apple\'s strategy looks visionary, and analyst and consumers alike fall over themselves to pay homage to Apple\'s dedication to design and quality. Yet, the iPod was exactly the kind of strategic play that the lessons of Betamax, not to mention Apple\'s own experience in the PC makrte, should have taught them would fail. The iPod was large and expensive. It was based on closed architecture that Apple refused to license, ran on proprietary software, and was actively resisted by the major content providers. Nevertheless, it was a smashing success".'
    },
    {
      class: 'OneUpOnWallStreet',
      title: 'One Up On Wall Street: How to Use What You Already Know to Make Money in the Market',
      author: 'Peter Lynch',
      summary: 'This investment classic explains how Peter Lynch became one of the most successful equity managers during his tenure at Fidelity between 1977 and 1990. Much had to do with picking winners early on, not being to focused on the initial valuation but allowing the growth to compound over long periods of time. Also, by no means was Peter Lynch a focus investor, having more than 1,000 shares in his portfolio.\n\
      The book has a number of very interesting stories that are both entertaining and educative but also shows that Peter Lynch having enormous grit that worked out well.',
      quote: 'Memorable quote: "Just because a share price goes up, doesn\'t mean you are right. Just because a share price goes down, doesn\'t mean you are wrong".'
    }, 
    {
      class: 'SimpleButNotEasy',
      title: 'Simple But Not Easy',
      author: 'Richard Oldfield',
      summary: 'Besides loving the title of the book, it\'s a slightly autobiographical book, biased towards investing and plenty of interesting mistakes made and what they taught the author. He explains different type of investments, the importance of fees, and the importance of measuring performance properly, when to fire your investment advisor as well as how to be a good client.',
      quote: 'Memorable quote: "The Nobel prize winner Kenneth Arrow had to make predictions when he was employed by the meteorological department of the US Air Force during the Second World War. He was asked to make medium- and long-term weather forecasts. He quickly concluded that his results were no better than randomly right and asked to be relieved of his responsibility. The reply came back" \'The Commanding General is well aware that the forecasts are no good. However, he needs them for planning purposes.\''
    },
    {
      class: 'JohnNeffonInvesting',
      title: 'John Neff on Investing',
      author: 'John Neff',
      summary: 'John Neff was portfolio manager for Vanguard\'s Windsor and Gemini funds for 31 years. His performance beat the market for 22 years while his total return was 57x money on his initial stake. He retired in 1995 as Senior Vice President and managing partner at Wellington Management Company, the fund’s investment advisor. Essentially, the book explains in some detail the one investment style that Neff used during his tenure, based on seven principal elements: Low P/E ratio; Fundamental growth in excess of 7%; Yield protection (and enhancement); Superior relationship of total return to P/E paid; No cyclical exposure without compensating P/E; Solid companies in growing fields; Strong fundamental case.',
      quote: 'Memorable quote: "Conventional wisdom suggests that, for investors, more information these days is a blessing and more competition is a curse. I\'d say the opposite is true. Coping with so much information runs the risk of distracting attention from the few variables that really matter."'
    }, 
    {
      class: 'ContrarianInvestment',
      title: 'Contrarian Investment Strategies: The Psychological Edge',
      author: 'David Dreman',
      summary: 'The book shows investors how to deal with contrarian selection and why it will often give better performance. The book explains that contrarian stocks offer extra protection in bear markets and often deliver better returns in bull markets, why the IPO is a guaranteed losers\' game and why dividends matter. Perhaps not the best written book, the statistical facts used to back up the statements are interesting.',
      quote: 'Memorable quote: "There\'s no question that people saw the excitement of the Internet, ... how important it would be. There was absolutely no question they caught it right in the late 1990s. But they paid far too much."'
    },
    {
      class: 'ZebrainLionCountry',
      title: 'A Zebra in Lion Country',
      author: 'Ralph Wanger',
      summary: 'Ralph Wanger is a semi-retired portfolio manager for the Acorn Fund, which he has ran since 1970, specialising in small cap, rapidly growing companies. This fund has one of the best track records in the mutual fund industry and the book explains his investment style (blend of value and growth.\n\
      His philosophy is that investors are like zebras in lion country: either you settle for meagre pickings by sticking to the middle of the herd or seek richer rewards on the outer edge, where hungry lions lurk.\n',
      quote: 'Memorable quote: "Since the Industrial Revolution began, going downstream - investing in businesses that will benefit from new technology rather than investing in the technology companies themselves - has often been the smarter strategy."'
    }, 
    {
      class: 'FinancialFolly',
      title: 'This Time is Different: Eight Centuries of Financial Folly',
      author: 'Carmen Reinhart',
      summary: 'In his book "The Black Swan", Nassim Nicholas Taleb gives a description of the library that Umberto Eco has at home. This library is sure to make an impact on visitors. Eco sorts his visitors in 2 camps - those who ask him if he has read all the books, and those who understand the value of books that have not been read yet but are used for research purposes. This is a book whose value lies in its comprehensive research of the financial history and there is no need to read this book as quickly as possible - it serves as a back up at times when we want to read about global financial crises.',
      quote: 'Memorable quote: "Today\'s emerging markets can hardly claim credit for inventing serial default. Spain\'s defaults established a record that as yet remains unbroken. Indeed, Spain managed to default seven times in the 19th century alone after having defaulted six times in the preceding three centuries. With its string of 19th century defaults, Spain took the mantle for most defaults from France, which had abrogated its debt obligations on eight occasions between 1500 and 1800. Because during episodes of external debt default the French monarchs had a habit of executing major domestic creditors, the population came to refer to these episodes as \"bloodletting\". The French finance minister Terray, who served from 1768 to 1774, even opined that governments should default at least once every hundred years in order to restore equilibrium."'
    }, 
    {
      class: 'ValueInvesting1',
      title: 'Value Investing: From Graham to Buffett and Beyond',
      author: 'Bruce Greenwald',
      summary: 'We love this book and use it consistently as a reference on how to use Earnings Power Value, private market value, the strength of the franchise and how to apply an appropriate growth rate and cost of capital rate for these earnings. The book was written by Bruce Greenwald, professor at Columbia University and deals with many examples of how value investing is perhaps more an art than a science, based on the different ways in which different investors apply similar methodologies.',
      quote: 'Memorable quote: "Still, when asked to name the mistake he makes most frequently, Edwin Schloss confesses to buying too much of the stock on the initial purchase and not leaving enough room to buy more when the price goes down."'
    },
    {
      class: 'ZerotoOne',
      title: 'Zero to One',
      author: 'Peter Thiel ',
      summary: 'What started as a course by Peter Thiel on start-ups and entrepreneurship at Stanford University in 2012, the detailed notes by one student resulted in this book. Peter Thiel\'s venture capital track record is one of the best, having made early investments (bets?) on Facebook and SpaceX, following on from a successful exit of PayPal. The great secret of our time is that there are still unchartered frontiers to explore and new inventions to create. Thiel begins with the contrarian promise that we live in an age of technological stagnation. Information technology has improved rapidly, but there is no reason why progress should be limited to computers or Silicon Valley. The book presents an optimistic view of the future of progress in America and a new way of thinking about innovation.',
      quote: 'Memorable quote: "At Founders Fund we saw (the clean-tech bubble) coming. The most obvious clue was sartorial: clean-tech executives were running around wearing suits and ties. This was a huge red flag, because real technologists wear T-shirts and jeans. So we instituted a blanket rule: pass on any company whose founders dressed up for pitch meetings."'
    }, 
    {
      class: 'GreatCrash1929',
      title: 'The Great Crash 1929',
      author: 'John Galbraith',
      summary: 'This is one of the most entertaining books on the crash of 1929, the lead up and the aftermath. It certainly is Galbraith\'s most accessible book. The book is almost sarcastic in the way in which is describes the lack of wisdom in crowds and the foolishness that prevented rational thinking during the late 1920\'s in the lead up to that famous October day.',
      quote: 'Memorable quote: "In good times people are relaxed, trusting, and money is always plentiful. But even though money is plentiful, there are always many people who need more. Under these circumstances the rate of fraud grows, and the rate of discovery falls off, and the fraud increases rapidly. In depression all this is reversed. Money is watched with a narrow, suspicious eye. Audits are penetrating and meticulous. Commercial morality is enormously improved. Fraud shrinks".'
    }, 
    {
      class: 'IntelligentInvestor',
      title: 'The Intelligent Investor',
      author: 'Benjamin Graham',
      summary: 'All-time classic on the merits and rationality on Graham\'s philosophy of "value investing", which ultimately inspired today\'s great investors including Warren Buffett, Charlie Munger, and Seth Klarman, to name but a few.',
      quote: 'Memorable quote: "No one really knows anything about what will happen in the distant future, but analysts and investors have strong views on the subject just the same".'
    }, 
    {
      class: 'MostImportantThing',
      title: 'The Most Important Thing Illuminated: Uncommon Sense for the Thoughtful Investor',
      author: 'Howard Marks',
      summary: 'Howard Marks is chairman of Oaktree Capital, a US-based alternative asset management company with close to U$100b under management. This book is a summary of thoughts he has shared with clients for over 20 years. It is extremely insightful as all his wisdom is concentrated and categorised. The Most important thing explains the keys to successful investment and the pitfalls that can destroy capital. He explains in great detail the relationship between value and price, dedicates three chapters to risk and also explains the role of luck.',
      quote: 'Memorable quote: "Investment success doesn\'t come from \'buying good things\', but rather from \'buying things well.\'"'
    }, 
    {
      class: 'HardThingaboutHardThings',
      title: 'The Hard Thing about Hard Things',
      author: 'Ben Horowitz',
      summary: 'While everybody seems to think that starting a company is fun, Ben Horowitz explains in a very candid way that, perhaps, it is not. The book uses Horowitz\'s own experience of founding, running, selling, buying, and investing in technology companies with plenty of quotes from hip hop and rap artists; there are not many books that use lyrics from the likes of Nas, Al Davis, and Jay Z. The book explains how to hire, fire and demote, how to deal with internal politics and many other issues that are mostly ignored in the mainstream management books, that tend to only focus on successes of companies rather than pitfalls.\n\
      Horowitz helps would-be or current entrepreneurs to understand what it is like to make difficult decisions. In the process, Horowitz is extremely funny and does not take himself too seriously.',
      quote: 'Memorable quote: "If you are going to eat shit, don\'t nibble".'
    }, 
    {
      class: 'TomorrowsGold',
      title: "Tomorrow's Gold: Asia's Age of Discovery",
      author: 'Marc Faber',
      summary: 'Faber\'s book is extremely insightful in terms of explaining financial history, how developed markets became developed and what to expect from the rise of Asia (the book was published in 2002). I loved the historic examples of new industries whereby investor sentiment took leave from reality, yet the underlying trend went in the predicted direction and over time, followed the expected market follies. Faber is extremely entertaining in describing market bubbles and sometimes gets carried away with new bubbles that are not there (yet?).\n\
      The book also deals with the issues of supply-side capital allocation in the wrong way; this is something that often is ignored as investors focus on demand-side predictions.\n\
      Comparing today\'s CNBC with the propaganda machines of Mussolini, Stalin, Mao and Hitler is certainly entertaining reading and makes us question the "small lies, big lies" crowd indoctrination.',
      quote: 'Memorable quote: "The degree of one\'s emotion varies inversely with one\'s knowledge of the facts - the less you know, the hotter you get" - Bertrand Russell'
    }, 
    {
      class: 'FiveRules',
      title: 'The Five Rules for Successful Stock Investing - Morningstar\'s guide to building wealth and winning in the market',
      author: 'Pat Dorsey',
      summary: 'This book is extremely useful in the way it explains economic moats, or competitive advantages for businesses in different industries. Essentially, the book describes in great detail how companies can build and sustain competitive advantages like product differentiation through technology or features, or trusted brands or reputation, lowest cost producer, switching costs and high barriers to entry, and the most desired of them all - network effects.',
      quote: 'Memorable quote: "High returns on capital will always be competed away eventually, and for most companies - and their investors - the regression is fast and painful."'
    }, 
    {
      class: 'YouCanBe',
      title: 'You Can Be A Stock Market Genius',
      author: 'Joel Greenblatt',
      summary: 'Most certainly the worst title of all investment books, it is also one of the most insightful books that explains what to look for when special situations like spin-offs, restructurings and mergers happen. Greenblatt uses a lot of humour with historical examples to explain why his \'theories\' have worked and will continue to work.',
      quote: 'Memorable quote: "But selling - that\'s a tough one. When do you sell? The short answer is - I don\'t know. I do, however, have a few tips."'
    }, 
    {
      class: 'ValueInvesting2',
      title: 'Value Investing: Tools and Techniques for Intelligent Investment',
      author: 'James Montier',
      summary: 'James Montier has been described as a maverick, iconoclast and enfant terrible by the press. That more or less sums up why this book is interesting as James shows why everything you ever learnt at business school is wrong, including Efficient Market Theory. He further explains how to think about valuation and risk, why investment process and investment outcome are different, and why patience and value investing will beat growth investing any day. The book is written in a very funny way to describe material that can sometimes be dry.',
      quote: 'Memorable quote: "What do goalkeepers facing a penalty and investors have in common? The answer is that both are prone to action. They feel they need to do something. However, inaction is also a decision."'
    }, 
    {
      class: 'MoreThanYouKnow',
      title: 'More Than You Know',
      author: 'Michael Mauboussin',
      summary: 'Mauboussin\'s first book has become a popular guide to wise investing. The book deals with investment philosophy, psychology and strategy and science as they pertain to money management.\n\
      The book offers tools to better understand the concepts of choice and risk, through practical advice and sound theory but also finds wisdom in a broad and deep range of fields, such as casino gambling, horse racing, psychology, and evolutionary biology. He analyzes the strategies of poker experts David Sklansky and Puggy Pearson and pinpoints parallels between mate selection in guppies and stock market booms.',
      quote: 'Memorable quote: "The plural of anecdote is not evidence."'
    }, 
    {
      class: 'PanicOnWallStreet',
      title: "Panic on Wall Street: A History of America's Financial Disasters",
      author: 'Robert Sobel',
      summary: 'While this book was released in 1968, it still offers some great insights into the story of Wall Street - essentially there is little new under the sun since the stock exchange was set up around 1790. There have been lots of people who lost their wealth through losing their rationality as they were blinded by the idea of striking it rick (quickly).\n\
      The book deals with many different bubbles - not just equities but also land, commerce and joint stock companies. Of the 12 panics described in this book, almost all of them had wealthy and supposedly intelligent men who were obliterated by the panics.',
      quote: 'Memorable quote: "It was conceivable that a buyer would put down $10 for $100 worth of stock, which itself represented $10 in equity and $90 in debt!" That was 1929.'
    }, 
    {
      class: 'InvestingtheTempletonWay',
      title: 'Investing the Templeton Way - the market beating strategies of value investing\'s legendary bargain hunter',
      author: 'Lauren Templeton and Scott Philips',
      summary: 'Yet another biography on a great investor, Sir John was different as he ventured over the US borders early in his investing career, was happy to short and go long and looked at different asset classes. \n\
      The book gives some insight into the background of Sir John and the way he became a better investor over time by not being able to control his emotions during times when others would lose theirs.',
      quote: 'Memorable quote: "Bull markets are born on pessimism, grow on scepticism, mature on optimism, and die on euphoria. The time of maximum pessimism is the best time to buy, and the time of maximum optimism is the best time to sell."'
    }, 
    {
      class: 'ValueInvestors',
      title: 'The Value Investors - lessons from the world\'s top fund managers',
      author: 'Ronald Chan',
      summary: 'Warren Buffett once said that "success in investing doesn’t correlate with I.Q. once you\'re above the level of 125. Once you have ordinary intelligence, what you need is the temperament to control the urges that get other people into trouble in investing."\n\
      In an attempt to understand exactly what kind of temperament Buffett was talking about, the author interviewed 12 value-investing professionals based in different territories, learning how their personal background, culture, and life experiences have shaped their investment mindset and strategy.\n\
      From 106-year-old Irving Kahn, who worked closely with \"father of value investing\" Benjamin Graham and remains active today, and 95-year-old Walter Schloss, to the co-founders of Hong Kong-based Value Partners, Cheah Cheng Hye and V-Nee Yeh, and Francisco García Paramés of Spain\'s Bestinver Asset Management, Chan chose investment luminaries to help him understand the international appeal - and success - of value investing.',
      quote: 'Memorable quote: "Bestinver\'s competitive advantage is that it has a very long-term investment approach. By that, I don\'t mean four to five years but the next twenty to thirty years."'
    },
    {
      class: 'TheBigShort',
      title: 'The Big Short: Inside the Doomsday Machine',
      author: 'Michael Lewis',
      summary: 'I really enjoyed Liar\'s poker and some of Lewis\' other books, like the New New thing. This one, however, I think excels in describing the madness of crowds and the pain and suffering those few rational investors have to go through when they bet against the crowd. This book is  extremely insightful in the way in which it describes the \'new normal\' of the US housing market, how almost everybody was involved and how some rational thinking created excellent payoffs, although this took patience, time and pain.',
      quote: 'Memorable quote: "In Bakersfield, California, a Mexican strawberry picker with an income of U$14,000 and no English was lent every penny he needed to buy a house for U$724,000."'
    }, 
    {
      class: 'CompetitionDemystified',
      title: 'Competition Demystified',
      author: 'Bruce Greenwald',
      summary: "Greenwald and his coauthor, Judd Kahn, offer an easy-to-follow method for understanding the competitive structure of your industry and developing an appropriate strategy for your specific position. Over the last two decades, the conventional approach to strategy has become frustratingly complex. It\'s easy to get lost in a sophisticated model of your competitors, suppliers, buyers, substitutes, and other players, while losing sight of the big question: Are there barriers to entry that allow you to do things that other firms cannot?",
      quote: 'A book that I have not read as yet - but cannot wait to start.'
    }, 
    {
      class: 'CommonStocksAnd',
      title: 'Common Stocks and Uncommon Profits and Other Writings',
      author: 'Philip Fisher',
      summary: 'Being Ken Fisher\'s son, Phil had big shoes to fill. His father Ken being a growth-focused investor, Phil\'s investment style is essentially a blended approach to marry growth and value. The biggest take-away being is that stocks should be held for the long run, even if they are overvalued, as long as you can be certain that its peak earning power hasn\'t passed.\n\
      Fisher makes one interesting point about capex and depreciation and amortisation and the way this is accounted for. As capex is always spent in current currency value, but depreciation and amortisation is spent in historic currency value, which has a higher value than the simple accounting rules show them for.',
      quote: 'Memorable quote: "This book is dedicated to all investors, large and small, who do NOT adhere to the philosophy: \'I have already made up my mind, don\'t confuse me with facts.\'"'
    }, 
    {
      class: 'PoorCharliesAlmanack',
      title: "Poor Charlie's Almanack: The Wit and Wisdom of Charles T. Munger",
      author: 'Charles T. Munger and Peter Kaufman',
      summary: 'I once tried to describe this book to a friend as a coffee table book. His reply was, when he\'d bought it: \'it\'s not a coffee table book, it\'s a coffee table.\'\n\
      The book is based on the writings of Benjamin Franklin in his "Poor Richard\'s almanac", which was published from 1733 to 1758.  Clearly, Benjamin Franklin has had a profound impact on Charlie Munger and as Warren Buffett describes in his foreword: \"What Benjamin had recommended, Charlie demanded. If Benjamin suggested saving pennies, Charlie raised the stakes. If Benjamin said be prompt, Charlie said be early.\"\n\
      This book is insightful not only in allowing the reader into the mind of Charlie Munger, but also for the extreme wisdom that is described through the various books recommended by Munger.\n\
      The last part of the book, Ten Talks, deals with speeches that Munger has given and which are extremely interesting, although not always that easy, as they portray Munger\'s view into subjects like worldly wisdom, practical thought on practical thought, investment practices of leading charitable foundations and the psychology of human misjudgement.',
      quote: 'Memorable quote: "When you mix raisins with turds, you\'ve still got turds."'
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



