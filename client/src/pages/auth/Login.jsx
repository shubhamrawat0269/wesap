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
import { FaWhatsapp } from 'react-icons/fa'

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
  const [error, setError] = useState('')
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
      </motion.div>
    </div>
  )
}

export default Login
