import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { BASE_URL, HttpResponse, HttpStatus } from '../../api/default'
import { useAuthContext } from '../../contexts/AuthContext';
import CardCourses from '../../components/CardCourses'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointLeft } from '@fortawesome/free-solid-svg-icons'
import Navbar from 'react-bootstrap/Navbar'
import Avatar from 'react-avatar'

const BookmarksPage = () => {
    const [userData, setUserData] = useState({ name: "" });
    const [data, setData] = useState({});
    const [isFetched, setIsFetched] = useState(false);
    const navigate = useNavigate();
    const { token, logged, user } = useAuthContext();

    useEffect(() => {
        const userData = localStorage.getItem('userData')
        if (userData != null)
            setUserData(JSON.parse(userData))
    }, [])

    const getBookmarks = async() => {
        var url = `${BASE_URL}/courses/favorites`
        try {
            const options = {
                method: 'GET',
                credentials: 'include',
                headers: {
                    // jwt: jwt,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    jwt: token
                }
            }
    
            var data = {"results" : []}

            while(true) {
                const response = await fetch(url, options);

                if (response.ok) {
                    const jsonData = await response.json();

                    data["results"] = data["results"].concat(jsonData.results)

                    if (jsonData.next == null) {
                        break
                    }

                    url = jsonData.next
                    //AUTH_DEBUG && console.log("AuthAPI::getBookmarks(): ", data);
                } else throw new Error("Error on getBookmarks()");
            }

            return new HttpResponse(HttpStatus.OK, data);
         } catch (error) {
                console.warn(error)
                return new HttpResponse(HttpStatus.ERROR, null);
         }
    }

    useEffect(() => {
        const getStudentCourses = async () => {
            setIsFetched(false)
            try {
                const responseCourses = await getBookmarks()
                if (responseCourses.status === HttpStatus.OK) {
                    setData(responseCourses.data)
                    setIsFetched(true)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getStudentCourses();
    }, [userData])

    return (
        <>
        <Container fluid>
        <Col>
            <Navbar>
            {logged && user ? (
              <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                &#128075;&nbsp; Hey, {user?.name?.split(' ')[0]}!
              </p>
            ) : (
              <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                &#128075;&nbsp; BEM-VINDO!
              </p>
            )}

            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                {user && user.photo ? <img src={user.photo} style={{ width: '50px', aspectRatio: 1, borderRadius: '50%', objectFit: 'fill', objectPosition: 'center', cursor: 'pointer' }} alt="profile" />
                  : <Avatar
                      name={(user?.name && user?.name.split(' ')[0]) || "O i"}
                      color="#0f5b7a"
                      size={30}
                      textSizeRatio={2}
                      round={true}
                  />}
                {/* {user && (
                  <Avatar
                    name={user.name}
                    color="#0f5b7a"
                    size={30}
                    textSizeRatio={2}
                    round={true}
                  />
                )} */}
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>

            <Row className="home-card mt-5">
                <div className="col">
                    <h1 className="mb-3 fs-5 fw-bold">Cursos favoritos</h1>

                    {isFetched ? (
                        data.results.length ? (
                            <Row className="g-4">
                                {data.results.map((course) => (
                                    <Col xs={12} lg={4} key={course.id}>
                                        <Link to={`/student/courses/${course.id}`}>
                                            <CardCourses teste={course} />
                                        </Link>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Container fluid>
                                <div class="d-flex align-items-center justify-content-center" style={{"height": "350px"}}>
                                    <span><h1>Você não tem nenhum curso marcado como favorito.</h1>
                                    <p className='fs-5' style={{ color: "#1dbfb0", cursor:"pointer" }} onClick={() => {navigate('/')}}>Clique aqui e procure algo do seu interesse <FontAwesomeIcon className='fs-5' style={{color:"yellow"}} icon={faHandPointLeft}/></p></span>
                                </div>
                            </Container>
                        )
                    ) : (
                        <p>Carregando...</p>
                    )}
                </div>
            </Row>
        </Col>
        </Container>
        </>
    )
}

export default BookmarksPage;
