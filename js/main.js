belongBuild = angular.module("belong-app", ["ui.router"]);

// Route Provider Starts

belongBuild.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state("Home", {
      url: "/",
      templateUrl: "Templates/home.html"
    })
    .state("search", {
      url: "/search",
      templateUrl: "Templates/search.html"
    });
});

// Home Controller logic

belongBuild.controller("homeController", [
  "$scope",
  "$state",
  "belongAPIservice",
  function($scope, $state, belong) {
    $scope.listItems = [];
    $scope.selectedList = {};
    $scope.init = function() {
      if (!sessionStorage.booksDetail) {
        belong.listAllItems().success(function(response) {
          $scope.listItems = response.booksDetail;
          storageToSession();
        });
      } else {
        retreiveSessionData();
      }
    };

    var retreiveSessionData = function() {
      $scope.listItems = JSON.parse(sessionStorage.booksDetail);
      if (sessionStorage.selectedData) {
        $scope.listItems = $scope.listItems.concat(
          JSON.parse(sessionStorage.selectedData)
        );
        storageToSession();
      }
    };

    var storageToSession = function() {
      sessionStorage.booksDetail = JSON.stringify($scope.listItems);
    };

    $scope.filterSecId = function(items, key) {
      var result = {};
      result = items.filter(function(val) {
        return val.shelfType === key;
      });
      return result;
    };

    $scope.updateList = function(val, list) {
      var index = $scope.listItems.indexOf(list);
      $scope.listItems[index].shelfType = val;
    };

    $scope.goToSearch = function() {
      $state.go("search");
    };

    $scope.init();
  }
]);

//Search Controller

belongBuild.controller("searchController", [
  "$scope",
  "$state",
  "belongAPIservice",
  function($scope, $state, belong) {
    $scope.user = {};
    $scope.showAuctiondata = [];
    var selectedData = [];
    $scope.submitAuctionForm = function(val) {
      if (val) {
        belong.searchItems($scope.user.search).success(function(response) {
          $scope.showAuctiondata = response.searchResult;
        });
      }
    };

    $scope.updateList = function(val, list) {
      var index = $scope.showAuctiondata.indexOf(list);
      $scope.showAuctiondata[index].shelfType = val;
      selectedData.push($scope.showAuctiondata[index]);
    };

    $scope.goToHome = function() {
      if (selectedData.length > 0) {
        storageToSession();
      }
      $state.go("Home");
    };

    var storageToSession = function() {
      sessionStorage.selectedData = JSON.stringify(selectedData);
    };
  }
]);

// Factories

belongBuild.factory("belongAPIservice", function($http) {
  var belongAPI = {};

  belongAPI.listAllItems = function() {
    return $http({
      method: "GET",
      url: "../json/member.json"
    });
  };
  belongAPI.searchItems = function(payload) {
    return $http({
      method: "GET",
      url: "../json/searchResult.json",
      data: payload
    });
  };

  return belongAPI;
});
