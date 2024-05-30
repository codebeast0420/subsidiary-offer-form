import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const subdiaries = [
    {
      name: "Deep Pharma Intelligence",
      url: "www.deep-pharma.tech",
      email: "info@deep-pharma.tech",
      logo: "https://static.wixstatic.com/media/50ab4b_5b82fb4244ee46bb9b4976d17d0bacc5~mv2.png/v1/fill/w_161,h_74,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/DPI%20blue_edited.png"
    },
    {
      name: "Aging Analytics Agency",
      url: "www.aginganalytics.com",
      email: "info@aginganalytics.com",
      logo: "https://static.wixstatic.com/media/d7b9fd_050872c71d1c4353a5b0261fbddd431f~mv2.png/v1/fill/w_168,h_84,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/aaa-logo.png"
    }
  ]

  const [data, setData] = useState({
    companyName: '',
    email: '',
    subsidiary: 0,
    industry: '',
    sectors: '',
    com1: '',
    com1desc: '',
    com2: '',
    com2desc: '',
    com3: '',
    com3desc: '',
    com4: '',
    com4desc: '',
    com5: '',
    com5desc: '',
    com6: '',
    com6desc: '',
    com7: '',
    com7desc: '',
  });

  const {
    companyName,
    email,
    subsidiary,
    industry,
    sectors,
    com1,
    com1desc,
    com2,
    com2desc,
    com3,
    com3desc,
    com4,
    com4desc,
    com5,
    com5desc,
    com6,
    com6desc,
    com7,
    com7desc,
  } = data;

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const handleChangeSub = (event) => {
    const selectedSubsidiaryIndex = event.target.value;

    setData(prevData => ({
      ...prevData,
      subsidiary: selectedSubsidiaryIndex,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    if (!companyName || !email) {
      console.log('here')
      return toast.error('Please fill in all fields');
    }

    if (companyName && email && !email.includes('@')) {
      return toast.error('Invalid email');
    }

    try {
      console.log('data', data);
      const response = await fetch('https://v1.nocodeapi.com/johndkv/google_sheets/sHitMQQLfiqiwMiN?tabId=Form responses 1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([[
          new Date().toLocaleString(),
          companyName,
          email,
          subdiaries[subsidiary].name,
          subdiaries[subsidiary].url,
          subdiaries[subsidiary].email,
          subdiaries[subsidiary].logo,
          industry,
          sectors,
          com1,
          com1desc,
          com2,
          com2desc,
          com3,
          com3desc,
          com4,
          com4desc,
          com5,
          com5desc,
          com6,
          com6desc,
          com7,
          com7desc,
        ]])
      });
      await response.json();
      toast.success('Company added successfully');
      setData({
        companyName: '',
        email: '',
        subsidiary: 0,
        industry: '',
        sectors: '',
        com1: '',
        com1desc: '',
        com2: '',
        com2desc: '',
        com3: '',
        com3desc: '',
        com4: '',
        com4desc: '',
        com5: '',
        com5desc: '',
        com6: '',
        com6desc: '',
        com7: '',
        com7desc: '',
      });
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className='w-100 d-flex align-items-center justify-content-center bg-dark p-5' onSubmit={handleSubmit}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <form className='card shadow-lg p-5 form bg-dark d-flex align-items-center' style={{ width: '60%', maxWidth: '800px' }}>
        <div className='card-header text-white text-center'>
          <h1>Create New Company</h1>
        </div>
        <div className='card-body mt-3 d-flex row'>
          <div className='form-group col-md-6'>
            <input type='text' name='companyName' placeholder='Company' className='form-control mt-1' value={data.companyName} onChange={handleChange} />
          </div>
          <div className='form-group col-md-6'>
            <input type='email' name='email' className='form-control mt-1' placeholder='Email' value={data.email} onChange={handleChange} />
          </div>
          <div className='form-group mt-3 col-md-6'>
            <select name='subsidiary' className='form-control mt-1' value={data.subsidiary} onChange={handleChangeSub}>
              {subdiaries.map((subsidiary, index) => (
                <option key={index} value={index}>{subsidiary.name}</option>
              ))}
            </select>
          </div>
          <div className='form-group mt-3 col-md-6'>
            <input type='text' name='industry' className='form-control mt-1' placeholder='Industry' value={data.industry} onChange={handleChange} />
          </div>
          <div className='form-group mt-3 col-md-6'>
            <input type='text' name='sectors' className='form-control mt-1' placeholder='Sectors' value={data.sectors} onChange={handleChange} />
          </div>
          <div className='col-md-6'></div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com1' className='form-control mt-1' placeholder='Componenent 1' value={data.com1} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com1desc' className='form-control mt-1' placeholder='Componenet 1 Description' value={data.com1desc} onChange={handleChange} />
            </div>
          </div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com2' className='form-control mt-1' placeholder='Componenet 2' value={data.com2} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com2desc' className='form-control mt-1' placeholder='Componenet 2 Description' value={data.com2desc} onChange={handleChange} />
            </div>
          </div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com3' className='form-control mt-1' placeholder='Componenet 3' value={data.com3} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com3desc' className='form-control mt-1' placeholder='Componenet 3 Description' value={data.com3desc} onChange={handleChange} />
            </div>
          </div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com4' className='form-control mt-1' placeholder='Componenet 4' value={data.com4} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com4desc' className='form-control mt-1' placeholder='Componenet 4 Description' value={data.com4desc} onChange={handleChange} />
            </div>
          </div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com5' className='form-control mt-1' placeholder='Componenet 5' value={data.com5} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com5desc' className='form-control mt-1' placeholder='Componenet 5 Description' value={data.com5desc} onChange={handleChange} />
            </div>
          </div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com6' className='form-control mt-1' placeholder='Componenet 6' value={data.com6} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com6desc' className='form-control mt-1' placeholder='Componenet 6 Description' value={data.com6desc} onChange={handleChange} />
            </div>
          </div>
          <div className='mt-2 col-md-6'>
            <div className='form-group mt-3'>
              <input type='text' name='com7' className='form-control mt-1' placeholder='Componenet 7' value={data.com7} onChange={handleChange} />
            </div>
            <div className='form-group mt-2'>
              <textarea type='text' name='com7desc' className='form-control mt-1' placeholder='Componenet 7 Description' value={data.com7desc} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className='card-footer d-flex justify-content-between mt-3 w-100'>
          <button className='btn btn-primary mt-2 p-2' style={{ width: '40%' }}>Submit</button>
          <a href='https://docs.google.com/document/d/1qd16HyHbsOcTav0lc0gUP1xMcA19m_drv6LIKkXkz7c/edit?usp=sharing' target='_blank' className='btn btn-primary mt-2 p-2' style={{ width: '40%' }}>View Template</a>
        </div>
      </form>
    </div>
  );
}

export default App;
