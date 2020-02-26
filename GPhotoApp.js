/**
 * GitHub  https://github.com/tanaikech/GPhotoApp<br>
 * Create new album.<br>
 * @param {Object} object Object
 * @return {Object} Return Object
 */
function createAlbum(object) {
    return new GPhotoApp().CreateAlbum(object);
}

/**
 * Get album list.<br>
 * @param {Bool} excludeNonAppCreatedData excludeNonAppCreatedData
 * @return {Object} Return Object
 */
function getAlbumList(excludeNonAppCreatedData) {
    return new GPhotoApp().GetAlbumList(excludeNonAppCreatedData);
}

/**
 * Get mediaItem list.<br>
 * @return {Object} Return Object
 */
function getMediaItemList() {
    return new GPhotoApp().GetMediaItemList();
}

/**
 * Get mediaItems.<br>
 * @param {Object} object Object
 * @return {Object} Return Object
 */
function getMediaItems(object) {
    return new GPhotoApp().GetMediaItems(object);
}

/**
 * Upload mediaItems using Blob.<br>
 * @param {Object} object Object
 * @return {Object} Return Object
 */
function uploadMediaItems(object) {
    return new GPhotoApp().UploadMediaItems(object);
}
;
(function(r) {
  var GPhotoApp;
  GPhotoApp = (function() {
    var getUploadToken;

    class GPhotoApp {
      constructor(p_) {
        this.accessToken = ScriptApp.getOAuthToken();
      }

      // --- methods --- begin
      CreateAlbum(obj_) {
        var params, res, url;
        if (!obj_) {
          throw new Error("Please input resource object.");
        }
        if (typeof obj_ === "string") {
          obj_ = {
            album: {
              title: obj_
            }
          };
        }
        url = "https://photoslibrary.googleapis.com/v1/albums";
        params = {
          url: url,
          method: "post",
          muteHttpExceptions: true,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          },
          payload: JSON.stringify(obj_),
          contentType: "application/json"
        };
        res = UrlFetchApp.fetchAll([params])[0];
        if (res.getResponseCode() !== 200) {
          throw new Error(res.getContentText());
        }
        return JSON.parse(res.getContentText());
      }

      GetAlbumList(excludeNonAppCreatedData_) {
        var albums, excludeNonAppCreatedData, pageToken, params, res, url;
        if (!excludeNonAppCreatedData) {
          excludeNonAppCreatedData = false;
        }
        url = `https://photoslibrary.googleapis.com/v1/albums?fields=*&pageSize=50&excludeNonAppCreatedData=${excludeNonAppCreatedData}`;
        params = {
          method: "get",
          muteHttpExceptions: true,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        };
        albums = [];
        pageToken = "";
        while (true) {
          params.url = url + (pageToken ? `&nextPageToken=${pageToken}` : "");
          res = UrlFetchApp.fetchAll([params])[0];
          r = JSON.parse(res.getContentText());
          if (res.getResponseCode() !== 200) {
            throw new Error(res.getContentText());
          }
          Array.prototype.push.apply(albums, r.albums);
          pageToken = r.nextPageToken;
          if (!pageToken) {
            break;
          }
        }
        return albums;
      }

      GetMediaItemList() {
        var mediaItems, pageToken, params, res, url;
        url = "https://photoslibrary.googleapis.com/v1/mediaItems?fields=*&pageSize=100";
        params = {
          method: "get",
          muteHttpExceptions: true,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        };
        mediaItems = [];
        pageToken = "";
        while (true) {
          params.url = url + (pageToken ? `&nextPageToken=${pageToken}` : "");
          res = UrlFetchApp.fetchAll([params])[0];
          r = JSON.parse(res.getContentText());
          if (res.getResponseCode() !== 200) {
            throw new Error(res.getContentText());
          }
          Array.prototype.push.apply(mediaItems, r.mediaItems);
          pageToken = r.nextPageToken;
          if (!pageToken) {
            break;
          }
        }
        return mediaItems;
      }

      GetMediaItems(obj_) {
        var params, q, res, url;
        if (!obj_ || !("mediaItemIds" in obj_)) {
          throw new Error("Please input resource object.");
        }
        url = "https://photoslibrary.googleapis.com/v1/mediaItems:batchGet";
        q = obj_.mediaItemIds.reduce((s, e, i, a) => {
          return s += "mediaItemIds=" + e + (a.length - 1 === i ? "" : "&");
        }, "?");
        params = {
          url: url + q,
          method: "post",
          muteHttpExceptions: true,
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "x-http-method-override": "GET"
          }
        };
        res = UrlFetchApp.fetchAll([params])[0];
        if (res.getResponseCode() !== 200) {
          throw new Error(res.getContentText());
        }
        return JSON.parse(res.getContentText());
      }

      UploadMediaItems(obj_) {
        var newMediaItems, params, payload, res, url;
        if (!obj_) {
          throw new Error("Please input resource object.");
        }
        url = "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate";
        newMediaItems = obj_.items.map((e) => {
          return {
            description: e.description,
            simpleMediaItem: {
              fileName: e.filename,
              uploadToken: getUploadToken.call(this, e)
            }
          };
        });
        payload = {
          albumId: obj_.albumId,
          newMediaItems: newMediaItems
        };
        params = {
          url: url,
          method: "post",
          muteHttpExceptions: true,
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          },
          contentType: "application/json",
          payload: JSON.stringify(payload)
        };
        res = UrlFetchApp.fetchAll([params])[0];
        if (res.getResponseCode() !== 200) {
          throw new Error(res.getContentText());
        }
        return JSON.parse(res.getContentText());
      }

    };

    GPhotoApp.name = "GPhotoApp";

    // --- methods --- end
    getUploadToken = function(obj_) {
      var params, res, url;
      url = "https://photoslibrary.googleapis.com/v1/uploads";
      params = {
        url: url,
        method: "post",
        muteHttpExceptions: true,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Goog-Upload-File-Name": obj_.filename,
          "X-Goog-Upload-Protocol": "raw"
        },
        contentType: "application/octet-stream",
        payload: obj_.blob
      };
      res = UrlFetchApp.fetchAll([params])[0];
      if (res.getResponseCode() !== 200) {
        throw new Error(res.getContentText());
      }
      return res.getContentText();
    };

    return GPhotoApp;

  }).call(this);
  return r.GPhotoApp = GPhotoApp;
})(this);
