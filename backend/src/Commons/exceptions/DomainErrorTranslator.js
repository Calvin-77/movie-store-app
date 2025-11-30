const InvariantError = require('./InvariantError');
 
const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};
 
DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat registered user karena properti yang dibutuhkan tidak ada'),
  'REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat registered user karena tipe data tidak sesuai'),
  'LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'NEW_AUTHENTICATION.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat authentication baru karena properti yang dibutuhkan tidak ada'),
  'NEW_AUTHENTICATION.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat authentication baru karena tipe data tidak sesuai'),
  'GET_MOVIES.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan movies karena properti yang dibutuhkan tidak ada'),
  'GET_MOVIES.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan movies karena tipe data tidak sesuai'),
  'MOVIE_DETAILS.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat menampilkan detail movie karena properti yang dibutuhkan tidak ada'),
  'MOVIE_DETAILS.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat menampilkan detail movie karena tipe data tidak sesuai'),
  'PURCHASE_MOVIE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membeli movie karena properti yang dibutuhkan tidak ada'),
  'PURCHASE_MOVIE.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membeli movie karena tipe data tidak sesuai'),
  'TOPUP_BALANCE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat topup balance karena properti yang dibutuhkan tidak ada'),
  'TOPUP_BALANCE.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat topup balance karena tipe data tidak sesuai'),
  'TOPUP_BALANCE.AMOUNT_MUST_BE_POSITIVE': new InvariantError('amount topup harus lebih dari 0'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
};

module.exports = DomainErrorTranslator;