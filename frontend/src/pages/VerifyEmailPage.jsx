import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy token xác thực.');
      return;
    }

    const doVerify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Xác thực thất bại. Token có thể đã hết hạn.');
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="flex flex-1 w-full min-h-screen items-center justify-center bg-surface-container-lowest p-xl">
      <div className="w-full max-w-[480px] bg-surface-container-lowest shadow-medium border border-outline-variant/30 rounded-xl p-xl text-center">
        {status === 'loading' && (
          <div>
            <span className="material-symbols-outlined text-[48px] animate-spin text-primary mb-md" style={{ fontVariationSettings: "'FILL' 0" }}>
              autorenew
            </span>
            <h3 className="text-h3 font-h3 mb-sm">Đang xác thực...</h3>
            <p className="text-body-md text-on-surface-variant">Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <span className="material-symbols-outlined text-[48px] text-primary mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <h3 className="text-h3 font-h3 mb-sm">Thành công!</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center h-xl px-xl bg-primary text-on-primary rounded-full hover:bg-primary-dark transition-colors font-semibold">
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <span className="material-symbols-outlined text-[48px] text-error mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <h3 className="text-h3 font-h3 mb-sm text-error">Xác thực thất bại</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">{message}</p>
            <Link to="/register" className="inline-flex items-center justify-center h-xl px-xl bg-primary text-on-primary rounded-full hover:bg-primary-dark transition-colors font-semibold">
              Quay lại đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
