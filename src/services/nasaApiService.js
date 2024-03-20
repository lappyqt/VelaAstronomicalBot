import axios from "axios";

export class nasaApiService {
    /** 
     * @param { string } date 
     * @returns { ApodResponse } 
    */
    async getAPOD(date) {
        const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&date=${date}`);
        return response.data;
    }  

    /** 
     * @param { number } count 
     * @returns { ApodResponse[] }
    */
    async getMultipleAPOD(count) {
        const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}&count=${count}`);
        return response.data;
    } 
}