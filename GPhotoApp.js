const PhotoApp = new (function () {

  // I chose the older-style `new (function() {})()` syntax for
  // encpsulating this class so that the interface is more consistent with
  // Google's existing ...App singleton instances. --Yuval
  let _accessToken = null;

  const encodeQueryString = (obj) => {
    const pairs = [];
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "undefined") {
        continue;
      }
      if ((typeof value === "object") && (value.constructor === Array)) {
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

  const _getUploadToken = ({filename, blob}) => {
    const params = {
      url: "https://photoslibrary.googleapis.com/v1/uploads",
      method: "POST",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`,
        "x-goog-upload-file-name": filename,
        "x-goog-upload-protocol": "raw"
      },
      contentType: "application/octet-stream",
      payload: blob
    };
    const res = UrlFetchApp.fetchAll([params])[0];
    if (res.getResponseCode() !== 200) {
      throw new Error(res.getContentText());
    }
    return res.getContentText();
  };
  
  const _apiCall = ({path, params, payload}) => {
    let url = `https://photoslibrary.googleapis.com/v1/${path}`;
    if (params) {
      const q = encodeQueryString(params);
      if (q.length) {
        url += '?' + q;
      }
    }
    let request = {
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    }
    if (payload) {
      request = {
        ...request,
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      };
    }

    response = UrlFetchApp.fetch(url, request);

    if (response.getResponseCode() !== 200) {
      throw new Error(response.getContentText());
    }
    return JSON.parse(response.getContentText());
  };

  function* _paginatedApiCall({path, params, payload, ...opts}) {
    if (!payload) {
      params = params || {};
    }

    let pageToken = undefined;
    while (true) {
      // attach pageToken to payload body or query params, depending on request type
      if (payload) {
        payload = {...payload, pageToken: pageToken};
      }
      else {
        params = {...params, pageToken: pageToken};
      }
      const body = _apiCall({path, params, payload, ...opts});
      if (Object.keys(body).length === 0) {
        break;
      }

      yield body;
      
      pageToken = body.nextPageToken;
      if (!pageToken) {
        break;
      }
    }
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

    return _apiCall({
      path: "albums", 
      payload: opts
    });
  };

  this.getAlbumList = function* (opts) {
    const pages = _paginatedApiCall({
      path: "albums",
      params: {
        fields: '*',
        pageSize: 50,
        excludeNonAppCreatedData: opts.excludeNonAppCreatedData
      }
    });
    for (const page of pages) {
      for (const album of page.albums) {
        yield album;
      }
    }
  };

  this.getMediaItemList = function* () {
    const pages = _paginatedApiCall({
      path: "mediaItems",
      params: {
        fields: '*',
        pageSize: 100
      }
    });    
    for (const page of pages) {
      for (const mediaItem of page.mediaItems) {
        yield mediaItem;
      }
    }
  };

  this.searchMediaItems = function* (opts) {
    opts = {
      pageSize: 100,
      ...(opts || {})
    };
    const pages = _paginatedApiCall({
      path: "mediaItems:search",
      payload: opts
    });
    for (const page of pages) {
      for (const mediaItem of page.mediaItems) {
        yield mediaItem;
      }
    }
  };

  this.getMediaItems = (opts) => {
    return _apiCall({
      path: "mediaItems:batchGet",
      params: {
        mediaItemIds: opts.mediaItemIds
      }
    });
  };

  this.getMediaItem = (opts) => {

    return _apiCall({
      path: `mediaItems/${encodeURIComponent(opts.mediaItemId)}`
    });
    
  };

  this.getMediaItemBlob = (mediaItem) => {
    // TODO : support other baseUrl modifications, as per
    //        https://developers.google.com/photos/library/guides/access-media-items#base-urls
    const url = mediaItem.baseUrl + "=d";
    const request = {
      method: "GET",
      muteHttpExceptions: true,
      headers: {
        "authorization": `Bearer ${_getAccessToken()}`
      }
    };

    const response = UrlFetchApp.fetch(url, request);

    if (response.getResponseCode() !== 200) {
      throw new Error(response.getContentText());
    }
    return response.getBlob();
  }

  this.uploadMediaItems = (opts) => {
    // NOTE : Media items can be created only within the albums created by your app.
    if (!opts) {
      throw new Error("Please input resource object.");
    }

    const newMediaItems = opts.items.map((item) => (
      {
        description: item.description,
        simpleMediaItem: {
          fileName: item.filename,
          uploadToken: _getUploadToken(item)
        }
      }
    ));

    return _apiCall({
      path: "mediaItems:batchCreate",
      payload: {
        albumId: opts.albumId,
        newMediaItems: newMediaItems
      }
    });
  };

})();
