angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/application', {
        templateUrl: '/apply.html',
        controller: 'ApplicationCtrl as application'
      })
      .when('/apply', {
        templateUrl: '/apply.html',
        controller: 'ApplicationCtrl as application'
      });
  }])
  .controller('ApplicationCtrl', ['$scope', '$location', '$filter', 'User', 'Application', function ($scope, $location, $filter, User, Application) {

    var self = this;
    var user = new User();
    var application = new Application();

    // Get the logged in user if it exists
    self.me = user.getMe();

    $scope.display = {};

    /**
    * Show a popup of a form field
    * @param field A name for the field
    */
    $scope.open = function (field) {
      $scope.display.blinds = true;
      $scope.display[field] = true;
    };

    /**
    * Close all form inputs
    */
    $scope.closeAll = function () {
      $scope.display = {};
    };

    /**
    * An object with an array of possible dietary restrictions,
    * an array of selected restrictions, and a function to toggle a
    * selection.
    */
    self.diet = {
      possible: [
        'Vegetarian',
        'Vegan',
        'Kosher',
        'Gluten Free',
        'Other'
      ],
      selected: [],
      toggleSelection: function (restriction) {
        var idx = this.selected.indexOf(restriction);
        if (idx > -1) {
          this.selected.splice(idx, 1);
        } else {
          this.selected.push(restriction);
        }
      }
    };

    /**
    * Pre-populate the form if the user has already submitted
    * an application.
    */
    application.get().
    success(function (data) {
      if (data.application) {
        angular.extend(self, data.application);
        self.first = String(self.first);
        self.travel = String(self.travel);
        if (self.dietary) self.diet.selected = self.dietary;
        self.phone = $filter('formatPhone')(self.phone);
        self.submitted = true;
      } else {
        self.submitted = false;
      }
    }).
    error(function (data) {
      self.errors = data.errors || ['An internal error occurred'];
    });

    /**
    * Submit or update the user's application
    */
    self.submit = function () {
      // make a string of dietary restrictions
      var restrictions = null;
      if (self.diet.selected.length) {
        restrictions = '';
        for (var i = 0; i < self.diet.selected.length; ++i) {
          restrictions += self.diet.selected[i] + '|';
        }
        restrictions = restrictions.substr(0, restrictions.length - 1);
      }

      // build the application object
      var app = {
        name: self.name,
        school: self.school,
        phone: self.phone.replace(/\D/g,''),
        shirt: self.shirt,
        demographic: self.demographic,
        first: self.first,
        year: self.year,
        age: self.age,
        gender: self.gender,
        major: self.major,
        conduct: self.conduct,
        travel: self.travel,
        waiver: self.waiver
      };
      if (restrictions) {
        angular.extend(app, {dietary: restrictions});
      }

      // submit the application
      if (self.submitted) {
        application.update(app).
        success(function (data) {
          $location.path('/');
        }).
        error(function (data) {
          self.errors = data.errors || ['An internal error occurred'];
        });
      } else {
        application.submit(app).
        success(function (data) {
          console.log(data);
          $location.path('/');
        }).
        error(function (data) {
          self.errors = data.errors || ['An internal error occurred'];
        });
      }
    };

  }]);
