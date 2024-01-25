import './styles.less';
import mainPosterImg from './images/main-poster.png';
import multipleCirclesImg from './images/multiple-circles.svg';
import multipleArrowImg from './images/multiple-arrow.svg';
import { Button } from 'aelf-design';
import Web3Button from 'components/Web3Button';
import { useNavigate } from 'react-router-dom';
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-body common-page page-body">
        <div className="home-frame">
          <div className="main-poster-wrap" style={{ backgroundImage: `url(${mainPosterImg})` }}>
            <div className="main-poster"></div>
          </div>
          <div className="home-content-warp">
            <div className="home-content">
              <img className="multiple-circles-wrap" src={multipleCirclesImg} alt="" />
              <img className="multiple-arrow-wrap" src={multipleArrowImg} alt="" />
              <div className="home-title">EWELL IDO</div>
              <div className="home-sub-title">
                Where Visionary Backs
                <br></br>
                <span className="special-word-wrap">
                  Meet
                  <div className="special-word-circle-wrap">
                    <div className="special-word-circle"></div>
                  </div>
                </span>
                <br />
                Exceptional Blockchain Ventures.
              </div>
              <div className="btn-area">
                <Button className="btn-wrap" type="primary" block>
                  Upcoming
                </Button>
                <Web3Button
                  className="btn-wrap"
                  block
                  onClick={() => {
                    navigate('/create-project');
                  }}>
                  Launch with EWELL
                </Web3Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
