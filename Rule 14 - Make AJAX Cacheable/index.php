<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rule 14</title>
  </head>
  <body>
    <input type="button" value="request" id="ajaxButton" />
    <script
      src="https://code.jquery.com/jquery-3.6.0.js"
      integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
      crossorigin="anonymous"
    ></script>
    <script>
      var localCache = {
        data: {},
        remove: function (url) {
          delete localCache.data[url];
        },
        exist: function (url) {
          return (
            localCache.data.hasOwnProperty(url) && localCache.data[url] !== null
          );
        },
        get: function (url) {
          console.log("Getting in cache for url" + url);
          return localCache.data[url];
        },
        set: function (url, cachedData, callback) {
          localCache.remove(url);
          localCache.data[url] = cachedData;
          if ($.isFunction(callback)) callback(cachedData);
        },
      };

      $(function () {
        var url = "/rule_14/data/";
        $("#ajaxButton").click(function (e) {
          $.ajax({
            url: url,
            data: {
              test: "value",
            },
            cache: true,
            beforeSend: function () {
              if (localCache.exist(url)) {
                doSomething(localCache.get(url));
                return false;
              }
              return true;
            },
            complete: function (jqXHR, textStatus) {
              localCache.set(url, jqXHR, doSomething);
            },
          });
        });
      });

      function doSomething(data) {
        console.log(data);
      }
    </script>
  </body>
</html>
