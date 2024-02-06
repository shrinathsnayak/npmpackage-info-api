const healthController = {
  getHealth: () => {
    return {
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date()
    };
  }
};

export default healthController;
