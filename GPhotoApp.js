// based on https://raw.githubusercontent.com/tanaikech/GPhotoApp/master/GPhotoApp.js

const PhotosApp = new (function () {

  // I chose the older-style `new (function() {})()` syntax for
  // encpsulating this class so that the interface is more consistent with
  // Google's existing ...App singleton instances. --Yuval
  let _accessToken = null;

  const encodeQueryString = (obj) => {
    const pairs = [];
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value.constructor === Array) {
        for (const el of value) {
          pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(el.toString()));
        }
      }
      else {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value.toString()));
      }
    }
    return pairs.join('&');
  };

  const _getAccessToken = () => {
    if (!_accessToken) {
      _accessToken = ScriptApp.getOAuthToken();
    }
    return _accessToken;
  };

  const _getUploadToken = (opts) => {
    const params = {
      url: "https://photoslibrary.googleapis.com/v1/uploads",
      method: "POST",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`,
        "x-goog-upload-file-name": opts.filename,
        "x-goog-upload-protocol": "raw"
      },
      contentType: "application/octet-stream",
      payload: opts.blob
    };
    const res = UrlFetchApp.fetchAll([params])[0];
    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return res.getContentText();
  };

  this.createAlbum = (opts) => {
    if (!opts) {
      throw new Error("Please input resource object.");
    }

    if (typeof opts === "string") {
      opts = {
        album: {
          title: opts
        }
      };
    }

    const url = "https://photoslibrary.googleapis.com/v1/albums";
    const params = {
      url: url,
      method: "POST",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      },
      payload: JSON.stringify(opts),
      contentType: "application/json"
    };

    res = UrlFetchApp.fetchAll([params])[0];

    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return JSON.parse(res.getContentText());
  }

  this.getAlbumList = (excludeNonAppCreatedData) => {
    if (!excludeNonAppCreatedData) {
      excludeNonAppCreatedData = false;
    }
    const q = encodeQueryString({
      fields: '*',
      pageSize: 50,
      excludeNonAppCreatedData: excludeNonAppCreatedData
    });
    const url = `https://photoslibrary.googleapis.com/v1/albums?${q}`;
    const params = {
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    };
    const albums = [];

    let pageToken = "";
    while (true) {
      params.url = url + (pageToken ? `&nextPageToken=${pageToken}` : "");
      const res = UrlFetchApp.fetchAll([params])[0];
      const r = JSON.parse(res.getContentText());
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
  };

  this.getMediaItemsList = function* () {
    const q = encodeQueryString({
      fields: '*',
      pageSize: 100
    });
    const url = "https://photoslibrary.googleapis.com/v1/mediaItems?" + q;
    const params = {
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    };

    let pageToken = null;
    while (true) {
      params.url = url + (pageToken ? `&pageToken=${pageToken}` : "");
      const res = UrlFetchApp.fetchAll([params])[0];
      const r = JSON.parse(res.getContentText());
      if (res.getResponseCode() !== 200) {
        throw new Error(res.getContentText());
      }
      if (typeof r.mediaItems === "undefined") {
        break;
      }

      for (const mediaItem of r.mediaItems) {
        yield mediaItem;
      }

      pageToken = r.nextPageToken;
      if (!pageToken) {
        break;
      }
    }
  }

  this.searchMediaItems = function* (opts) {
    const url = "https://photoslibrary.googleapis.com/v1/mediaItems:search";
    const params = {
      url: url,
      method: "POST",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      },
      contentType: "application/json"      
    };

    let pageToken = undefined;
    while (true) {
      params.payload = JSON.stringify({...opts, pageToken: pageToken});
      
      const res = UrlFetchApp.fetchAll([params])[0];
      const r = JSON.parse(res.getContentText());
      if (res.getResponseCode() !== 200) {
        throw new Error(res.getContentText());
      }
      if (typeof r.mediaItems === "undefined") {
        break;
      }

      for (const mediaItem of r.mediaItems) {
        yield mediaItem;
      }

      pageToken = r.nextPageToken;
      if (!pageToken) {
        break;
      }
    }
  }

  this.getMediaItems = (opts) => {
    
    if (!opts || !("mediaItemIds" in opts)) {
      throw new Error("Please input resource object.");
    }
    const url = "https://photoslibrary.googleapis.com/v1/mediaItems:batchGet";
    const q = encodeQueryString({"mediaItemIds": opts.mediaItemIds});
    
    const params = {
      url: url + '?' + q,
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    };
    const res = UrlFetchApp.fetchAll([params])[0];
    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return JSON.parse(res.getContentText());
  }


  this.getMediaItem = (opts) => {
    
    if (!opts || !("mediaItemId" in opts)) {
      throw new Error("Please input resource object.");
    }
    const url = "https://photoslibrary.googleapis.com/v1/mediaItems/" + encodeURIComponent(opts.mediaItemId);
    
    const params = {
      url: url,
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    };
    const res = UrlFetchApp.fetchAll([params])[0];
    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return JSON.parse(res.getContentText());
  }

  this.getMediaItemBlob = (mediaItem) => {
    // TODO : support other baseUrl modifications, as per
    //        https://developers.google.com/photos/library/guides/access-media-items#base-urls
    const url = mediaItem.baseUrl + "=d";
    const params = {
      url: url,
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    };

    const res = UrlFetchApp.fetchAll([params])[0];

    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return res.getBlob();
  }

  this.uploadMediaItems = (opts) => {
    // NOTE : Media items can be created only within the albums created by your app.

    if (!opts) {
      throw new Error("Please input resource object.");
    }

    const newMediaItems = opts.items.map((e) => (
      {
        description: e.description,
        simpleMediaItem: {
          fileName: e.filename,
          uploadToken: _getUploadToken(e)
        }
      }
    ));

    const url = "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate";
    
    const payload = {
      albumId: opts.albumId,
      newMediaItems: newMediaItems
    };
    const params = {
      url: url,
      method: "POST",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      },
      contentType: "application/json",
      payload: JSON.stringify(payload)
    };
    
    const res = UrlFetchApp.fetchAll([params])[0];

    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return JSON.parse(res.getContentText());
  }

  this.name = "PhotosApp";

})();
