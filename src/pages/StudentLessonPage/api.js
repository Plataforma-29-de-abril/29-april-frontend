import { BASE_URL, HttpResponse, HttpStatus } from "../../api/default"

const getLesson = async (id) => {
    try {
        const url = `${BASE_URL}/lessons/lessons/${id}`
        const options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        }
        const response = await fetch(url, options)
        if (response.ok) {
            const data = await response.json()

            if(data.prev && data.prev.banner)
                data.prev.banner = BASE_URL + data.prev.banner

            if(data.next && data.next.banner)
                data.next.banner = BASE_URL + data.next.banner

            if(data.video){
                let pathVideo = data.video.split('/')
                data.video = BASE_URL + '/lessons/lessons/stream-video/' + pathVideo[pathVideo.length - 1]
            }

            if(data.extern_video_link){
                data.video = data.extern_video_link
            }
            
            console.log(data)

            return new HttpResponse(HttpStatus.OK, data)
        }
        throw new Error("LessonAPI::getLesson()")
    } catch (error) {
        console.warn(error);
        return new HttpResponse(HttpStatus.ERROR, null);
    }
}


const completeLessonAsStudent = async (idStudent, idLesson) => {
    try {
        const url = `${BASE_URL}/lessons/lessons/complete-lesson/${idLesson}/${idStudent}`;
        const options = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
        }
        const response = await fetch(url, options)
        if (response.ok) {
            const data = await response.json()
            return new HttpResponse(HttpStatus.OK, data)
        }
        throw new Error("LessonAPI::completeLessonAsStudent()")
    } catch (error) {
        console.warn(error);
        return new HttpResponse(HttpStatus.ERROR, null);
    }
}

const getCourse = async (id) => {
    try {
      const url = `${BASE_URL}/courses/courses/${id}`
      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.json()
  
        if (data.lessons && data.lessons.length) {
          data.lessons = data.lessons.sort((lessonA, lessonB) => lessonA.id < lessonB.id ? -1 : 1);
        }
  
        return new HttpResponse(HttpStatus.OK, data)
      }
  
      throw new Error("CourseAPI::getCourse()")
    } catch (error) {
      console.warn(error);
      return new HttpResponse(HttpStatus.ERROR, null);
    }
  }

export const LessonAPI = {
    getLesson,
    completeLessonAsStudent,
    getCourse
}