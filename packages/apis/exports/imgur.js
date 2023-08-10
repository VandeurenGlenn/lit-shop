class Imgur {
    #authorizationHeader;
    #anonymous;
    constructor({ clientId, accessToken, anonymous }) {
        if (accessToken)
            this.#authorizationHeader = `Bearer ${accessToken}`;
        if (clientId)
            this.#authorizationHeader = `Client-ID ${clientId}`;
        this.#anonymous = accessToken === undefined || anonymous;
    }
    get headers() {
        const headers = new Headers();
        headers.append("Authorization", this.#authorizationHeader);
        return headers;
    }
    async createAlbum({ ids, title, description, cover }) {
        const headers = this.headers;
        const formdata = new FormData();
        if (ids) {
            if (this.#anonymous)
                formdata.append('deletehashes[]', ids.join(','));
            else
                formdata.append('ids[]', ids.join(','));
        }
        if (title)
            formdata.append('title', title);
        if (description)
            formdata.append('description', description);
        if (cover)
            formdata.append('cover', cover);
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: formdata
        };
        try {
            const response = await fetch("https://api.imgur.com/3/album", requestOptions);
            return (await response.json()).data;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async removeAlbum(deleteHash) {
        const headers = this.headers;
        const requestOptions = {
            method: 'DELETE',
            headers: headers
        };
        try {
            const response = await fetch(`https://api.imgur.com/3/album/${deleteHash}`, requestOptions);
            return response.text();
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getAlbum(id) {
        const headers = this.headers;
        const requestOptions = {
            method: 'GET',
            headers: headers
        };
        try {
            const response = await fetch(`https://api.imgur.com/3/album/${id}`, requestOptions);
            return (await response.json()).data;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getAlbumImages(id) {
        const headers = this.headers;
        const requestOptions = {
            method: 'GET',
            headers: headers
        };
        try {
            const response = await fetch(`https://api.imgur.com/3/album/${id}/images`, requestOptions);
            return (await response.json()).data;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    /**
     * Upload image to Imgur (pass deletahash if album is anonymous)
     * @param imgurImageParams
     * @param album
     * @returns
     */
    async addImage({ image, title, description, album, type }) {
        const headers = this.headers;
        const formdata = new FormData();
        if (album)
            formdata.append('album', album);
        formdata.append('image', image);
        formdata.append('type', type);
        formdata.append('description', description);
        formdata.append('title', title);
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: formdata
        };
        try {
            const response = await fetch("https://api.imgur.com/3/image", requestOptions);
            return (await response.json()).data;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getImage(id) {
        const headers = this.headers;
        const requestOptions = {
            method: 'GET',
            headers: headers
        };
        console.log(headers.get('Authorization'));
        try {
            const response = await fetch(`https://api.imgur.com/3/image/${id}`, requestOptions);
            return (await response.json()).data;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async removeImage(deleteHash) {
        const headers = this.headers;
        const requestOptions = {
            method: 'DELETE',
            headers: headers
        };
        try {
            const response = await fetch(`https://api.imgur.com/3/image/${deleteHash}`, requestOptions);
            return response.text();
        }
        catch (error) {
            throw new Error(error);
        }
    }
}

export { Imgur as default };
