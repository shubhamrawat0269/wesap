import * as yup from 'yup'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { avatars } from '../../utils/avatar'
import countries from '../../utils/countries'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../../store/useUserStore'
import useLoginStore from '../../store/useLoginStore'
import useThemeStore from '../../store/useThemeStore'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  FaArrowLeft,
  FaChevronDown,
  FaUser,
  FaWhatsapp,
} from 'react-icons/fa'
import Spinner from '../../components/Spinner'
import {
  sendOtp,
  updateUserProfile,
  verifyOtp,
} from '../../services/user.service'

const loginValidationShema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, 'Phone Number must be a digit')
      .transform((value, originalValue) =>
        originalValue.trim() === '' ? null : value
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email('Please Enter Valid Email')
      .transform((value, originalValue) =>
        originalValue.trim() === '' ? null : value
      ),
  })
  .test(
    'at-least-one',
    'Either email or phone number is required',
    function (value) {
      return !!(value.phoneNumber || value.email)
    }
  )

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, 'Otp must be exactly 6 digit')
    .required('Otp is required'),
})

const profileValidationSchema = yup.object().shape({
  username: yup.string().required('username is required'),
  agreed: yup.bool().oneOf([true], 'you must be agreed to the terms'),
})

const ProgressBar = ({ theme, step }) => {
  return (
    <div
      className={`w-full ${theme == 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 mb-6`}
    >
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${(step / 3) * 100}%` }}
      ></div>
    </div>
  )
}

const Login = () => {
  const {
    step,
    setStep,
    setUserPhoneData,
    userPhoneData,
    resetLoginState,
  } = useLoginStore()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  // avatar not yet included
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
  const [profilePictureFile, setProfilePictureFile] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useUserStore()
  const { theme, setTheme } = useThemeStore()

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationShema),
  })

  const {
    setValue: setOtpValue,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  })

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  })

  const filerCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  )

  const onLoginSubmit = async () => {
    try {
      setLoading(true)
      if (email) {
        const response = await sendOtp(null, null, email)
        if (response.status === 'success') {
          toast.success('OTP is send to your email')
          setUserPhoneData({ email })
          setStep(2)
        }
      } else {
        const response = await sendOtp(
          phoneNumber,
          selectedCountry.dialCode
        )
        if (response.status === 'success') {
          toast.success('OTP is send to phone number')
          setUserPhoneData({
            phoneNumber,
            phoneSuffix: selectedCountry.dialCode,
          })
          setStep(2)
        }
      }
    } catch (error) {
      console.log(error)
      setError(error.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const onOtpSubmit = async () => {
    try {
      setLoading(true)
      if (!userPhoneData) {
        throw new Error('Phone or email data is missing')
      }
      const otpString = otp.join('')
      let response
      if (userPhoneData?.email) {
        response = await verifyOtp(
          null,
          null,
          otpString,
          userPhoneData.email
        )
      } else {
        response = await verifyOtp(
          userPhoneData.phoneNumber,
          userPhoneData.phoneSuffix,
          otpString
        )
      }

      if (response.status === 'success') {
        toast.success('OTP verify successfully')
        const user = response.data?.user
        if (user?.username && user?.profilePicture) {
          setUser(user)
          toast.success('Welcome back to Wesap')
          navigate('/')
          resetLoginState()
        } else {
          setStep(3)
        }
      }
    } catch (error) {
      console.log(error)
      setError(error.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePictureFile(file)
      setProfilePicture(URL.createObjectURL(file))
    }
  }

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('username', data.username)
      formData.append('agreed', data.agreed)

      if (profilePictureFile) {
        formData.append('media', profilePictureFile)
      } else {
        formData.append('profilePicture', selectedAvatar)
      }

      await updateUserProfile(formData)
      toast.success('Welcome back to Whatsapp')
      navigate('/')
      resetLoginState()
    } catch (error) {
      console.log(error)
      setError(error.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpValue('otp', newOtp.join(''))
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleBack = () => {
    setStep(1)
    setUserPhoneData(null)
    setOtp(['', '', '', '', '', ''])
    setError(null)
  }

  return (
    <div
      className={`min-h-screen ${theme == 'dark' ? 'bg-gray-900' : 'bg-linear-to-br from-green-400 to-blue-500'} flex items-center justify-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme == 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-6 shadow-2xl w-full max-w-md relative`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.2,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 grid place-content-center"
        >
          <FaWhatsapp className="w-16 h-16 text-white" />
        </motion.div>
        <h1
          className={`text-3xl font-bold text-center mb-6 ${theme == 'dark' ? 'text-white' : 'text-gray-800'}`}
        >
          Wesap Login
        </h1>

        <ProgressBar step={step} theme={theme} />

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {step == 1 && (
          <form
            className="space-y-4"
            onSubmit={handleLoginSubmit(onLoginSubmit)}
          >
            <p
              className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Enter yourphone number to receive an OTP
            </p>

            <div className="relative">
              <div className="flex">
                <div className="relative w-1/3">
                  <button
                    type="button"
                    className={`flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center ${theme === 'dark' ? 'text-white bg-gray-700 border-gray-600' : 'text-gray-900 bg-gray-100 border-gray-300'} border rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100`}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span>
                      {selectedCountry.flag}{' '}
                      {selectedCountry.dialCode}
                    </span>
                    <FaChevronDown className="ml-2" />
                  </button>

                  {showDropdown && (
                    <div
                      className={`absolute z-10 w-full mt-1 ${theme == 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-md shadow-lg max-h-60 overflow-auto`}
                    >
                      <div
                        className={`sticky top-0 ${theme == 'dark' ? 'bg-gray-700' : 'bg-white'} p-2`}
                      >
                        <input
                          type="text"
                          placeholder="Search Countries..."
                          value={searchTerm}
                          onChange={(e) =>
                            setSearchTerm(e.target.value)
                          }
                          className={`w-full px-2 py-1 border ${theme == 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                        />
                      </div>

                      {filerCountries.map((country) => (
                        <button
                          key={country.alpha2}
                          type="button"
                          className={`w-full text-left px-3 py-2 ${theme == 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} focus:outline-none focus:bg-gray-100`}
                          onClick={() => {
                            setSelectedCountry(country)
                            setShowDropdown(false)
                          }}
                        >
                          {country.flag} ({country.dialCode}){' '}
                          {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  {...loginRegister('phoneNumber')}
                  value={phoneNumber}
                  placeholder="phone number"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-2/3 px-4 py-2 border ${theme == 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${loginErrors.phoneNumber ? 'border-red-500' : ''}`}
                />
              </div>

              {loginErrors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="mx-3 text-gray-300 text-sm font-medium">
                Or
              </span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            <div
              className={`flex items-center border rounded-md px-3 py-2 ${theme == 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <FaUser
                className={`mr-2 text-gray-400 ${theme == 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              />

              <input
                type="email"
                {...loginRegister('email')}
                value={email}
                placeholder="Email (optional)"
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-transparent focus:outline-none ${theme == 'dark' ? 'text-white' : 'text-black'} ${loginErrors.email ? 'border-red-500' : ''}`}
              />

              {loginErrors.email && (
                <p className="text-red-500 text-sm">
                  {loginErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              {loading ? <Spinner /> : 'Send OTP'}
            </button>
          </form>
        )}

        {step == 2 && (
          <form
            onSubmit={handleOtpSubmit(onOtpSubmit)}
            className="space-y-4"
          >
            <p
              className={`text-center ${theme == 'dark' ? 'text-gray-300' : 'text-gray-600'} `}
            >
              Please enter the 6-digit OTP send to your{' '}
              {userPhoneData ? userPhoneData.phoneSuffix : 'Email'}{' '}
              {userPhoneData?.phoneNumber &&
                userPhoneData?.phoneNumber}
            </p>

            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  className={`w-12 h-12 text-center border ${theme == 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${otpErrors.otp ? 'border-red-500' : ''}`}
                />
              ))}
            </div>
            {otpErrors.otp && (
              <p className="text-red-500 text-sm">
                {otpErrors.otp.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              {loading ? <Spinner /> : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className={`w-full mt-2 ${theme == 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} py-2 rounded-md hover:bg-gray-300 transition flex items-center`}
            >
              <FaArrowLeft className="mr-2" />
              Wrong number? Go Back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default Login
