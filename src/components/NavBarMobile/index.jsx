import React, {useEffect, useState} from 'react';
import './style.css'
import { Navbar, Card, ListGroup, ListGroupItem, Nav, NavItem, NavDropdown, Container } from 'react-bootstrap';
import { SiBookstack, SiNotepadplusplus } from 'react-icons/si'
import { FaBookmark, FaUser } from 'react-icons/fa'
import { ImBooks } from 'react-icons/im'
import { GiArchiveRegister } from 'react-icons/gi'
import { TbLogin, TbNote } from 'react-icons/tb'
import { AiFillHome } from 'react-icons/ai'
import { BsKeyFill, BsReverseListColumnsReverse } from 'react-icons/bs'
import { Link, useNavigate } from 'react-router-dom';
import { OnlyNotLogged, StrictRoute } from '../../contexts/StrictRoute';
import { Roles } from '../../api/default';
import { faNoteSticky } from '@fortawesome/free-solid-svg-icons';


const NavLinkTo = ({ href, title, icon }) => (
  <ListGroup horizontal>
    <ListGroup.Item
      style={{
        paddingLeft: '5px',
        paddingRight: '0px',
      }}
      className="li"
    >
      {icon}
    </ListGroup.Item>
    <ListGroup.Item className="li">
      <Link
        className="hover-clic"
        style={{ color: '#8a9094' }}
        to={href}
      >
        {title}
      </Link>
    </ListGroup.Item>
  </ListGroup>
)

const NavText = ({ text }) => (
  <Navbar.Text
    className="fw-bold"
    style={{
      fontSize: 'x-small',
      color: '#b4bbbf',
      paddingLeft: '16px',
    }}
  >
    {text}
  </Navbar.Text>
)

const NavGroupFlush = ({ children }) => (
  <ListGroup variant="flush">
    <ListGroupItem
      className="list"
      style={{
        paddingLeft: '15px',
        paddingRight: '0px',
      }}
    >
      {children}
    </ListGroupItem>
  </ListGroup>
)

const FAIcon = ({ Icon }) => (
  <Icon style={{ color: '#8a9094', fontSize: '18' }} className="me-2" />
)

const SideNavMobile = () => {
    const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
    useEffect(() => {
        console.log("alo")
    }, [expanded])

  return (
<Navbar expanded={expanded} expand="lg" className="bg-body-tertiary show-mobile-version">
      <Container>
      <Navbar.Toggle onClick={() => setExpanded(expanded ? false : "expanded")} aria-controls="responsive-navbar-nav" className='mr-auto'/>
        <Navbar.Brand onClick={()=> navigate("/")}>
            <img style={{width: '200px'}} src={'https://i.ibb.co/r3QPmSt/logo.png'} alt="Logo" />
        </Navbar.Brand>
        <Navbar.Collapse id="responsive-navbar-nav">
      <Nav onClick={() => setExpanded(false)} className='me-auto home'>
            <NavText text='GERAL DESKTOP' />
            <NavGroupFlush>
              <NavLinkTo title='Home' href='/' icon={<FAIcon Icon={AiFillHome} />} />
              <StrictRoute roles={[Roles.STUDENT, Roles.ADMIN, Roles.PROFESSOR]}>
                <NavLinkTo title='Meu Perfil' href='/perfil' icon={<FAIcon Icon={FaUser} />} />
              </StrictRoute>
              <OnlyNotLogged>
                <NavLinkTo title='Cadastre-se' href='/register' icon={<FAIcon Icon={GiArchiveRegister} />} />
                <NavLinkTo title='Logar-se' href='/login' icon={<FAIcon Icon={TbLogin} />} />
              </OnlyNotLogged>
            </NavGroupFlush>

            <StrictRoute roles={[Roles.STUDENT]}>
              <NavText text='ALUNO' />
              <NavGroupFlush>
                {/* <NavLinkTo title='Cursos' href='/student/courses' icon={<FAIcon Icon={ImBooks} />} /> */}
                <NavLinkTo title='Minhas Notas' href='/student/notes' icon={<FAIcon Icon={TbNote} />} />
                <NavLinkTo title='Bookmarks' href='/student/marked-courses' icon={<FAIcon Icon={FaBookmark} />} />
                <NavLinkTo title='Meus cursos' href='/student/enrolled-courses' icon={<FAIcon Icon={SiBookstack} />} />
              </NavGroupFlush>
            </StrictRoute>


            <StrictRoute roles={[Roles.PROFESSOR]}>
              <NavText text='PROFESSOR' />
              <NavGroupFlush>
                <NavLinkTo title='Meus cursos' href='/professor/courses' icon={<FAIcon Icon={ImBooks} />} />
                <NavLinkTo title='Criar curso' href='/professor/courses/create' icon={<FAIcon Icon={SiBookstack} />} />
              </NavGroupFlush>
            </StrictRoute>

            <StrictRoute roles={[Roles.ADMIN]}>
              <NavText text='ADMIN' />
              <NavGroupFlush>
                <NavLinkTo title='Gerar Convite' href='/admin/generate-invite' icon={<FAIcon Icon={BsKeyFill} />} />
                <NavLinkTo title='Gerenciar Professores' href='/admin/manage-teachers' icon={<FAIcon Icon={BsReverseListColumnsReverse} />} />
              </NavGroupFlush>
            </StrictRoute>
            
          <StrictRoute roles={[Roles.STUDENT, Roles.ADMIN, Roles.PROFESSOR]}>
              <NavLinkTo title='Sair' href='/logout' icon={<FAIcon Icon={TbLogin} />} />
          </StrictRoute>
      </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar> 
    );
  }

  export default SideNavMobile;

