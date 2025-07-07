// api.js
import { DangerRight } from '../component/api/toastServices';

import axios from 'axios';


export const  fetchExpertData = async(params) => {
    try {
        const response = await axios.get('admin/expert/getAll', {
        params: {
          start: params.start,
          limit: params.limit,
          search: params.search,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      DangerRight(error?.message)
      throw error;
    }
  }

  export const addExpert = async(payload) =>{
    try{
      const response = await axios.post(`admin/expert`,payload)
      return response.data.expert
    }catch(error){
      console.error('Error fetching data:', error);
      DangerRight(error?.message)
      throw error;
    }
  }

  export const updateExpert = async(payload) =>{
    try{
      const response = await axios.patch(`admin/expert/update/${payload?.expertId}`, payload?.formData)
      return response.data.expert
    }catch(error){
      console.error('Error fetching data:', error);
      DangerRight(error?.message)
      throw error;
    }
  }

  export const adminProfile = async() =>{
    try{
      const response = await axios.get('admin/getProfile')
      return response.data
    }catch(error){
      console.error('Error fetching data:', error);
      DangerRight(error?.message)
      throw error;
    }
  }
