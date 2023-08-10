FROM ubuntu:18.04

LABEL maintainer="Weekday <support@weekday.work>"
LABEL description="Janus Gateway Docker image"

RUN apt-get update -y \
    && apt-get upgrade -y

RUN apt-get install -y \
    build-essential \
    libmicrohttpd-dev \
    libjansson-dev \
    libnice-dev \
    libssl-dev \
    libsofia-sip-ua-dev \
    libglib2.0-dev \
    libopus-dev \
    libogg-dev \
    libini-config-dev \
    libcollection-dev \
    pkg-config \
    gengetopt \
    libtool \
    autotools-dev \
    automake \
    sudo \
    make \
    git \
    doxygen \
    graphviz \
    cmake \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    ninja-build \
    libconfig-dev

RUN pip3 install meson

RUN cd ~ \
    && git clone https://gitlab.freedesktop.org/libnice/libnice \
    && cd libnice \
    && meson --prefix=/usr build \
    && ninja -C build \
    && sudo ninja -C build install

RUN cd ~ \
    && git clone https://github.com/cisco/libsrtp.git \
    && cd libsrtp \
    && git checkout v2.2.0 \
    && ./configure --prefix=/usr --enable-openssl \
    && make shared_library \
    && sudo make install

RUN cd ~ \
    && git clone https://github.com/sctplab/usrsctp \
    && cd usrsctp \
    && ./bootstrap \
    && ./configure --prefix=/usr \
    && make \
    && sudo make install

RUN cd ~ \
    && git clone https://github.com/warmcat/libwebsockets.git \
    && cd libwebsockets \
    && git checkout v3.2.0 \
    && mkdir build \
    && cd build \
    && cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr .. \
    && cmake -DLWS_MAX_SMP=1 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS='-fpic' .. \
    && make \
    && sudo make install

RUN apt-get install -y \
    libcurl4-openssl-dev \
    nginx

RUN cd ~ \
    && git clone https://github.com/meetecho/janus-gateway.git \
    && cd janus-gateway \
    && git checkout v0.10.10 \
    && sh autogen.sh \
    && ./configure --prefix=/opt/janus --disable-rabbitmq --disable-mqtt --disable-docs \
    && make \
    && make install \
    && make configs

COPY ./janus.cfg /opt/janus/etc/janus/janus.jcfg
COPY ./janus.transport.http.cfg /opt/janus/etc/janus/janus.transport.http.jcfg

EXPOSE 80 7088 8088 8188 8089
EXPOSE 10000-10200/udp

CMD /opt/janus/bin/janus --nat-1-1=${DOCKER_IP}
