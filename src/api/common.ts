import axios, { type AxiosRequestConfig } from 'axios'

const Axios = axios.create({
  baseURL: '',
  timeout: 3000
});

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    Axios.get(url, config)
      .then((res) => {
        if (res.status) {
         console.log(res.data)
          resolve(res.data as T)
        } else {
          reject(new Error(String(res.status)))
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}
